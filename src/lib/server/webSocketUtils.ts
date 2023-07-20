import { parse } from 'url';
import { nanoid } from 'nanoid';
import { WebSocketServer, WebSocket, type Server } from 'ws';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { registerWebsocketEventHandlers } from './webSocket';
import { parseCookie } from '../util';
import { WSServerMessageTypes } from '../ws';
export const GlobalThisWSS = Symbol.for('sveltekit.wss');

export interface ExtendedWebSocket extends WebSocket {
  socketId: string;
  room: string;
}

// You can define server-wide functions or class instances here

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type ExtendedWebSocketServer = Server<ExtendedWebSocket>;

//export type ExtendedWebSocketServer = Server<ExtendedWebSocket>;

export type ExtendedGlobal = typeof globalThis & {
  [GlobalThisWSS]: ExtendedWebSocketServer;
};

export const onHttpServerUpgrade = (req: IncomingMessage, sock: Duplex, head: Buffer) => {
  const pathname = req.url ? parse(req.url).pathname : null;
  if (pathname !== '/websocket') return;

  const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];

  wss.handleUpgrade(req, sock, head, (ws) => {
    // TODO check room query parameter before upgrade
    const query = parse(req.url || '', true).query;
    if (query.room) {
      ws.room = query.room.toString();
      wss.emit('connection', ws, req);
    } else {
      ws.close();
    }
  });
};

export const createWSSGlobalInstance = async () => {
  const wss = new WebSocketServer({
    noServer: true,
    clientTracking: false
  }) as unknown as ExtendedWebSocketServer;

  (globalThis as ExtendedGlobal)[GlobalThisWSS] = wss;

  wss.on('connection', (ws, req) => {
    const socketId = parseCookie(req.headers.cookie).userId;
    if (!socketId) {
      ws.send(
        JSON.stringify({
          type: WSServerMessageTypes.ERROR,
          payload: 'No cookie found, please refresh the page'
        })
      );
      ws.close();
      return;
    }
    ws.socketId = socketId;

    console.log(`[wss:globla] client connected (${ws.socketId})`);

    ws.on('close', () => {
      console.log(`[wss:global] client disconnected (${ws.socketId})`);
    });

    registerWebsocketEventHandlers(ws);
  });

  return wss;
};
