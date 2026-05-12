import { OnEvent } from '@nestjs/event-emitter';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { RoomClosedPayload, RoomSummary } from '@akgames/types';
import { SERVER_EVENTS } from '@akgames/events';
import { Server, Socket } from 'socket.io';
import { RoomsService } from '../rooms/rooms.service.js';

@WebSocketGateway({ namespace: '/lobby', cors: true })
export class LobbyGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server!: Server;

  constructor(private readonly roomsService: RoomsService) {}

  handleConnection(client: Socket): void {
    client.emit(SERVER_EVENTS.ROOM_LIST, this.roomsService.listRooms());
  }

  @OnEvent('room.created')
  onRoomCreated(summary: RoomSummary): void {
    this.server.emit(SERVER_EVENTS.ROOM_CREATED, summary);
  }

  @OnEvent('room.updated')
  onRoomUpdated(summary: RoomSummary): void {
    this.server.emit(SERVER_EVENTS.ROOM_UPDATED, summary);
  }

  @OnEvent('room.closed')
  onRoomClosed(payload: RoomClosedPayload): void {
    this.server.emit(SERVER_EVENTS.ROOM_CLOSED, payload);
  }
}
