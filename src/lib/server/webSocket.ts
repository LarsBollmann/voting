import type { ExtendedWebSocket } from './webSocketUtils';
import {
  WSServerMessageTypes,
  type WSClientMessage,
  WSClientMessageTypes,
  type State
} from '../ws';
import { connectToRedis, type ExtendedRedisClient, type Room } from './db';

export const createWsStateFromDBState = (
  dbState: Room,
  room_id: string,
  socketId: string
): State => {
  return {
    roomId: room_id,
    socketId: socketId,
    proposals: dbState.proposals.map((proposal) => ({
      name: proposal.name,
      canDelete: proposal.user === socketId
    })),
    userCount: dbState.users.length,
    screen: dbState.screen,
    winner: dbState.winner,
    voteCount: dbState.votes.length.toString() + '/' + dbState.users.length.toString(),
    hasVoted: dbState.votes.find((vote) => vote.user === socketId) !== undefined,
    isAdmin: dbState.admin === socketId
  };
};

const sendState = async (ws: ExtendedWebSocket, db: ExtendedRedisClient) => {
  const room_id = ws.room;

  const room = (await db.json.get(room_id)) as unknown as Room;

  if (room) {
    const state = createWsStateFromDBState(room, room_id, ws.socketId);
    ws.send(
      JSON.stringify({ type: WSServerMessageTypes.SEND_STATE, payload: JSON.stringify(state) })
    );
  } else {
    ws.close();
  }
};

export const registerWebsocketEventHandlers = async (ws: ExtendedWebSocket) => {
  const db = await connectToRedis();

  const room = (await db.json.get(ws.room)) as Room;
  if (!room) {
    ws.close();
    return;
  }

  if (!room.users.includes(ws.socketId)) {
    if (room.screen !== 'lobby') {
      ws.close();
      return;
    }
    await db.addUser(ws.room, ws.socketId);
  }

  await sendState(ws, db);
  const sub = db.duplicate();

  await sub.connect();

  // Send state to client after publish to room channel
  await sub.subscribe(ws.room, () => {
    sendState(ws, db);
  });

  ws.on('message', (event: Event) => {
    const message: WSClientMessage = JSON.parse(event.toString());
    switch (message.type) {
      case WSClientMessageTypes.ADD_PROPOSAL: {
        if (message.payload !== '' && message.payload.length < 100) {
          db.addProposal(ws.room, ws.socketId, message.payload);
        }
        break;
      }
      case WSClientMessageTypes.REMOVE_PROPOSAL: {
        db.removeProposal(ws.room, message.payload);
        break;
      }
      case WSClientMessageTypes.START_VOTING: {
        db.startVoting(ws.room);
        break;
      }
      case WSClientMessageTypes.VOTE: {
        db.addVote(ws.room, ws.socketId, JSON.parse(message.payload));
        break;
      }
      case WSClientMessageTypes.SHOW_RESULTS: {
        db.showResults(ws.room);
        break;
      }
      case WSClientMessageTypes.RESET: {
        db.resetRoom(ws.room);
        break;
      }
      case WSClientMessageTypes.START_PROPOSING: {
        db.startProposing(ws.room);
        break;
      }
    }
  });

  ws.on('close', () => {
    sub.unsubscribe();
    sub.quit();
  });
};
