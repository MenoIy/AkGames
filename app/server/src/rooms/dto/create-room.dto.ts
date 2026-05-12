import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { GameType } from '@akgames/types';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsEnum(GameType)
  gameType!: GameType;
}
