import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomBytes } from 'crypto';
import { Player, Room, RoomSummary } from '@akgames/types';
import { AddPlayerResult, CreateRoomData, IRoomRepository } from './rooms.repository.js';

const MAX_PLAYERS = 10;

@Injectable()
export class RoomsService implements IRoomRepository {
  private readonly rooms = new Map<string, Room>();

  constructor(private readonly events: EventEmitter2) {}

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
    this.events.emit('room.created', this.toSummary(room));
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
    this.events.emit('room.updated', this.toSummary(room));
    return 'ok';
  }

  removePlayer(roomId: string, socketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.players = room.players.filter((p) => p.socketId !== socketId);
    if (room.players.length === 0) {
      this.closeRoom(roomId);
    } else {
      this.events.emit('room.updated', this.toSummary(room));
    }
  }

  addSpectator(roomId: string, player: Player): 'ok' | 'not_found' {
    const room = this.rooms.get(roomId);
    if (!room) return 'not_found';
    room.spectators.push(player);
    this.events.emit('room.updated', this.toSummary(room));
    return 'ok';
  }

  removeSpectator(roomId: string, socketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.spectators = room.spectators.filter((p) => p.socketId !== socketId);
    this.events.emit('room.updated', this.toSummary(room));
  }

  listRooms(): RoomSummary[] {
    return Array.from(this.rooms.values()).map((r) => this.toSummary(r));
  }

  closeRoom(id: string): void {
    this.rooms.delete(id);
    this.events.emit('room.closed', { id });
  }

  private toSummary(room: Room): RoomSummary {
    return {
      id: room.id,
      name: room.name,
      gameType: room.gameType,
      status: room.status,
      playerCount: room.players.length,
      spectatorCount: room.spectators.length,
      createdAt: room.createdAt,
    };
  }
}
