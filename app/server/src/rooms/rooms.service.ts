import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Player, Room, RoomSummary } from '@akgames/types';
import { AddPlayerResult, CreateRoomData, IRoomRepository } from './rooms.repository.js';

const MAX_PLAYERS = 10;

@Injectable()
export class RoomsService implements IRoomRepository {
  private readonly rooms = new Map<string, Room>();

  createRoom(data: CreateRoomData): Room {
    const room: Room = {
      id: randomBytes(8).toString('base64url').slice(0, 10),
      name: data.name,
      gameType: data.gameType,
      status: 'waiting',
      players: [],
      spectators: [],
      createdAt: Date.now(),
    };
    this.rooms.set(room.id, room);
    return room;
  }

  getRoom(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  addPlayer(roomId: string, player: Player): AddPlayerResult {
    const room = this.rooms.get(roomId);
    if (!room) return 'not_found';
    if (room.players.length >= MAX_PLAYERS) return 'full';
    room.players.push(player);
    return 'ok';
  }

  removePlayer(roomId: string, socketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.players = room.players.filter((p) => p.socketId !== socketId);
    if (room.players.length === 0) this.closeRoom(roomId);
  }

  addSpectator(roomId: string, player: Player): 'ok' | 'not_found' {
    const room = this.rooms.get(roomId);
    if (!room) return 'not_found';
    room.spectators.push(player);
    return 'ok';
  }

  removeSpectator(roomId: string, socketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.spectators = room.spectators.filter((p) => p.socketId !== socketId);
  }

  listRooms(): RoomSummary[] {
    return Array.from(this.rooms.values()).map((room) => ({
      id: room.id,
      name: room.name,
      gameType: room.gameType,
      status: room.status,
      playerCount: room.players.length,
      spectatorCount: room.spectators.length,
      createdAt: room.createdAt,
    }));
  }

  closeRoom(id: string): void {
    this.rooms.delete(id);
  }
}
