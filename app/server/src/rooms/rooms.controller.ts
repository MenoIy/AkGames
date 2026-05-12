import { Body, Controller, Get, Post } from '@nestjs/common';
import { RoomSummary } from '@akgames/types';
import { CreateRoomDto } from './dto/create-room.dto.js';
import { RoomsService } from './rooms.service.js';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() dto: CreateRoomDto): { id: string } {
    const room = this.roomsService.createRoom(dto);
    return { id: room.id };
  }

  @Get()
  list(): RoomSummary[] {
    return this.roomsService.listRooms();
  }
}
