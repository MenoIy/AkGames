import { Module } from '@nestjs/common';
import { RoomsModule } from '../rooms/rooms.module.js';
import { GameGateway } from './game.gateway.js';

@Module({
  imports: [RoomsModule],
  providers: [GameGateway],
})
export class GameModule {}
