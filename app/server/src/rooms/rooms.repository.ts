import { GameType, Player, Room, RoomSummary } from '@akgames/types';

export interface CreateRoomData {
  name: string;
  gameType: GameType;
}

export type AddPlayerResult = 'ok' | 'full' | 'not_found';

export interface IRoomRepository {
  createRoom(data: CreateRoomData): Room;
  getRoom(id: string): Room | undefined;
  addPlayer(roomId: string, player: Player): AddPlayerResult;
  removePlayer(roomId: string, socketId: string): void;
  addSpectator(roomId: string, player: Player): 'ok' | 'not_found';
  removeSpectator(roomId: string, socketId: string): void;
  listRooms(): RoomSummary[];
  closeRoom(id: string): void;
}
