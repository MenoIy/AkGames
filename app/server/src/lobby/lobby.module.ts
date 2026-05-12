import { Module } from '@nestjs/common';
import { RoomsModule } from '../rooms/rooms.module.js';
import { LobbyGateway } from './lobby.gateway.js';

@Module({
  imports: [RoomsModule],
  providers: [LobbyGateway],
})
export class LobbyModule {}
