import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import type {
  ChatMessage,
  ChatSendPayload,
  GameJoinPayload,
  GameJoinedPayload,
  GamePresencePayload,
  Player,
} from '@akgames/types';
import { CLIENT_EVENTS, SERVER_EVENTS } from '@akgames/events';
import { Server, Socket } from 'socket.io';
import { RoomsService } from '../rooms/rooms.service.js';

const GRACE_PERIOD_MS = 30_000;

interface SocketMeta {
  roomId: string;
  displayName: string;
  role: 'player' | 'spectator';
}

@WebSocketGateway({ namespace: '/game', cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server!: Server;

  private readonly socketMeta = new Map<string, SocketMeta>();
  private readonly disconnectTimers = new Map<
    string,
    { timer: NodeJS.Timeout; meta: SocketMeta }
  >();
  private readonly rateLimits = new Map<string, number>();

  private static readonly MAX_MSG_LEN = 500;
  private static readonly RATE_LIMIT_MS = 1_000;

  constructor(private readonly roomsService: RoomsService) {}

  handleConnection(): void {
    // Join event drives room entry
  }

  handleDisconnect(client: Socket): void {
    const meta = this.socketMeta.get(client.id);
    if (!meta) return;
    this.socketMeta.delete(client.id);
    this.rateLimits.delete(client.id);

    const key = this.disconnectKey(meta.roomId, meta.displayName);
    const timer = setTimeout(() => {
      this.disconnectTimers.delete(key);
      if (meta.role === 'player') {
        this.roomsService.removePlayer(meta.roomId, client.id);
      } else {
        this.roomsService.removeSpectator(meta.roomId, client.id);
      }
      this.broadcastPresence(meta.roomId);
      this.broadcastSystem(meta.roomId, `${meta.displayName} left the room`);
    }, GRACE_PERIOD_MS);

    this.disconnectTimers.set(key, { timer, meta });
  }

  @SubscribeMessage(CLIENT_EVENTS.GAME_JOIN)
  handleJoin(
    @MessageBody() payload: GameJoinPayload,
    @ConnectedSocket() client: Socket,
  ): GameJoinedPayload | { error: string } {
    const { roomId, displayName } = payload;

    if (!displayName?.trim()) throw new WsException('Display name required');

    const room = this.roomsService.getRoom(roomId);
    if (!room) throw new WsException('Room not found');

    // Check for reconnect within grace period
    const key = this.disconnectKey(roomId, displayName);
    const pending = this.disconnectTimers.get(key);
    if (pending) {
      clearTimeout(pending.timer);
      this.disconnectTimers.delete(key);
      const { meta } = pending;

      // Update socketId in room
      const players = meta.role === 'player' ? room.players : room.spectators;
      const existing = players.find((p) => p.displayName === displayName);
      if (existing) existing.socketId = client.id;

      this.socketMeta.set(client.id, { ...meta });
      void client.join(roomId);
      return { room, messages: [], role: meta.role };
    }

    // New join — determine role
    const player: Player = { socketId: client.id, displayName };
    const result = this.roomsService.addPlayer(roomId, player);
    let role: 'player' | 'spectator';

    if (result === 'full' || result === 'not_found') {
      if (result === 'not_found') throw new WsException('Room not found');
      this.roomsService.addSpectator(roomId, player);
      role = 'spectator';
    } else {
      role = 'player';
    }

    this.socketMeta.set(client.id, { roomId, displayName, role });
    void client.join(roomId);

    const systemText =
      role === 'spectator'
        ? `${displayName} joined as spectator`
        : `${displayName} joined the room`;

    this.broadcastPresence(roomId);
    this.broadcastSystem(roomId, systemText, client.id);

    const freshRoom = this.roomsService.getRoom(roomId)!;
    return { room: freshRoom, messages: [], role };
  }

  @SubscribeMessage(CLIENT_EVENTS.GAME_LEAVE)
  handleLeave(@ConnectedSocket() client: Socket): void {
    const meta = this.socketMeta.get(client.id);
    if (!meta) return;
    this.socketMeta.delete(client.id);

    if (meta.role === 'player') {
      this.roomsService.removePlayer(meta.roomId, client.id);
    } else {
      this.roomsService.removeSpectator(meta.roomId, client.id);
    }

    void client.leave(meta.roomId);
    this.broadcastPresence(meta.roomId);
    this.broadcastSystem(meta.roomId, `${meta.displayName} left the room`);
  }

  @SubscribeMessage(CLIENT_EVENTS.CHAT_SEND)
  handleChatSend(@MessageBody() payload: ChatSendPayload, @ConnectedSocket() client: Socket): void {
    const meta = this.socketMeta.get(client.id);
    if (!meta) throw new WsException('Not in a room');

    const text = payload?.text?.trim();
    if (!text) throw new WsException('Message cannot be empty');
    if (text.length > GameGateway.MAX_MSG_LEN) throw new WsException('Message too long');

    const now = Date.now();
    const lastSent = this.rateLimits.get(client.id) ?? 0;
    if (now - lastSent < GameGateway.RATE_LIMIT_MS) throw new WsException('Rate limit exceeded');
    this.rateLimits.set(client.id, now);

    const msg: ChatMessage = {
      type: 'user',
      senderName: meta.displayName,
      role: meta.role,
      text,
      timestamp: now,
    };
    this.server.to(meta.roomId).emit(SERVER_EVENTS.CHAT_MESSAGE, msg);
  }

  private broadcastPresence(roomId: string): void {
    const room = this.roomsService.getRoom(roomId);
    if (!room) return;
    const payload: GamePresencePayload = {
      players: room.players,
      spectators: room.spectators,
    };
    this.server.to(roomId).emit(SERVER_EVENTS.GAME_PRESENCE, payload);
  }

  private broadcastSystem(roomId: string, text: string, excludeSocketId?: string): void {
    const msg: ChatMessage = { type: 'system', text, timestamp: Date.now() };
    if (excludeSocketId) {
      this.server.to(roomId).except(excludeSocketId).emit(SERVER_EVENTS.CHAT_SYSTEM, msg);
    } else {
      this.server.to(roomId).emit(SERVER_EVENTS.CHAT_SYSTEM, msg);
    }
  }

  private disconnectKey(roomId: string, displayName: string): string {
    return `${roomId}:${displayName}`;
  }
}
