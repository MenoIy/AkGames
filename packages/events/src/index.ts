export const CLIENT_EVENTS = {
  // Game namespace (/game)
  GAME_JOIN: 'game:join',
  GAME_LEAVE: 'game:leave',

  // Chat
  CHAT_SEND: 'chat:send',
} as const;

export const SERVER_EVENTS = {
  // Lobby namespace (/lobby)
  ROOM_LIST: 'room:list',
  ROOM_CREATED: 'room:created',
  ROOM_UPDATED: 'room:updated',
  ROOM_CLOSED: 'room:closed',

  // Game namespace (/game)
  GAME_JOINED: 'game:joined',

  // Chat
  CHAT_MESSAGE: 'chat:message',
  CHAT_SYSTEM: 'chat:system',

  // Error
  ERROR: 'error',
} as const;

export type ClientEventKey = keyof typeof CLIENT_EVENTS;
export type ClientEventValue = (typeof CLIENT_EVENTS)[ClientEventKey];

export type ServerEventKey = keyof typeof SERVER_EVENTS;
export type ServerEventValue = (typeof SERVER_EVENTS)[ServerEventKey];
