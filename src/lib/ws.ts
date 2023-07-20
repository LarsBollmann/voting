export type State = {
  roomId: string;
  socketId: string;
  proposals: {
    name: string;
    canDelete: boolean;
  }[];
  screen: Screen;
  winner: string;
  voteCount: string;
  hasVoted: boolean;
  userCount: number;
  isAdmin: boolean;
};

export enum WSClientMessageTypes {
  START_PROPOSING = 'START_PROPOSING',
  ADD_PROPOSAL = 'ADD_PROPOSAL',
  REMOVE_PROPOSAL = 'REMOVE_PROPOSAL',
  VOTE = 'VOTE',
  START_VOTING = 'START_VOTING',
  SHOW_RESULTS = 'SHOW_RESULTS',
  RESET = 'RESET',
  PING = 'PING'
}

export enum WSServerMessageTypes {
  SEND_STATE = 'SEND_STATE',
  ERROR = 'ERROR',
  PONG = 'PONG'
}

export type Screen = 'lobby' | 'proposing' | 'voting' | 'results' | '';

export type WSClientMessage = {
  type: WSClientMessageTypes;
  payload: string;
};

export type WSServerMessage = {
  type: WSServerMessageTypes;
  payload: string;
};
