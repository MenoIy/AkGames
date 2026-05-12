export const EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Game
  GAME_START: 'game:start',
  GAME_END: 'game:end',
  GAME_UPDATE: 'game:update',

  // Player
  PLAYER_JOIN: 'player:join',
  PLAYER_LEAVE: 'player:leave',
  PLAYER_MOVE: 'player:move',

  // Error
  ERROR: 'error',
} as const;

export type EventKey = keyof typeof EVENTS;
export type EventValue = (typeof EVENTS)[EventKey];
