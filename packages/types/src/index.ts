export enum GameType {
  TicTacToe = 'tic_tac_toe',
  Chess = 'chess',
}

export interface Player {
  socketId: string;
  displayName: string;
}

export interface Room {
  id: string;
  name: string;
  gameType: GameType;
  status: 'waiting' | 'in_progress';
  players: Player[];
  spectators: Player[];
  createdAt: number;
}

export interface RoomSummary {
  id: string;
  name: string;
  gameType: GameType;
  status: 'waiting' | 'in_progress';
  playerCount: number;
  spectatorCount: number;
  createdAt: number;
}

export interface ChatMessage {
  type: 'user' | 'system';
  senderName?: string;
  role?: 'player' | 'spectator';
  text: string;
  timestamp: number;
}

// Socket.io event payloads

export interface GameJoinPayload {
  roomId: string;
  displayName: string;
}

export interface GameJoinedPayload {
  room: Room;
  messages: ChatMessage[];
  role: 'player' | 'spectator';
}

export interface ChatSendPayload {
  text: string;
}

export interface ChatSystemPayload {
  text: string;
  timestamp: number;
}

export interface RoomClosedPayload {
  id: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
}
