import { EventEmitter2 } from '@nestjs/event-emitter';
import { GameType, Player } from '@akgames/types';
import { RoomsService } from './rooms.service.js';

const makePlayer = (socketId: string): Player => ({
  socketId,
  displayName: `Player_${socketId}`,
});

const mockEmitter = { emit: jest.fn() } as unknown as EventEmitter2;

describe('RoomsService', () => {
  let service: RoomsService;

  beforeEach(() => {
    service = new RoomsService(mockEmitter);
  });

  describe('createRoom', () => {
    it('creates a room with correct shape', () => {
      const room = service.createRoom({ name: 'Test', gameType: GameType.Chess });
      expect(room.id).toHaveLength(10);
      expect(room.name).toBe('Test');
      expect(room.gameType).toBe(GameType.Chess);
      expect(room.status).toBe('waiting');
      expect(room.players).toEqual([]);
      expect(room.spectators).toEqual([]);
    });

    it('assigns unique IDs', () => {
      const a = service.createRoom({ name: 'A', gameType: GameType.Chess });
      const b = service.createRoom({ name: 'B', gameType: GameType.Chess });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('addPlayer', () => {
    it('returns ok when slot available', () => {
      const room = service.createRoom({ name: 'R', gameType: GameType.Chess });
      expect(service.addPlayer(room.id, makePlayer('s1'))).toBe('ok');
    });

    it('returns not_found for unknown room', () => {
      expect(service.addPlayer('unknown', makePlayer('s1'))).toBe('not_found');
    });

    it('returns full when 10 players already joined', () => {
      const room = service.createRoom({ name: 'R', gameType: GameType.Chess });
      for (let i = 0; i < 10; i++) {
        service.addPlayer(room.id, makePlayer(`s${i}`));
      }
      expect(service.addPlayer(room.id, makePlayer('s10'))).toBe('full');
    });

    it('caps players at 10', () => {
      const room = service.createRoom({ name: 'R', gameType: GameType.Chess });
      for (let i = 0; i < 12; i++) {
        service.addPlayer(room.id, makePlayer(`s${i}`));
      }
      expect(service.getRoom(room.id)!.players).toHaveLength(10);
    });
  });

  describe('removePlayer', () => {
    it('removes the correct player', () => {
      const room = service.createRoom({ name: 'R', gameType: GameType.Chess });
      service.addPlayer(room.id, makePlayer('s1'));
      service.addPlayer(room.id, makePlayer('s2'));
      service.removePlayer(room.id, 's1');
      expect(service.getRoom(room.id)!.players.map((p) => p.socketId)).toEqual(['s2']);
    });

    it('auto-closes room when last player leaves', () => {
      const room = service.createRoom({ name: 'R', gameType: GameType.Chess });
      service.addPlayer(room.id, makePlayer('s1'));
      service.removePlayer(room.id, 's1');
      expect(service.getRoom(room.id)).toBeUndefined();
    });

    it('does not close room when other players remain', () => {
      const room = service.createRoom({ name: 'R', gameType: GameType.Chess });
      service.addPlayer(room.id, makePlayer('s1'));
      service.addPlayer(room.id, makePlayer('s2'));
      service.removePlayer(room.id, 's1');
      expect(service.getRoom(room.id)).toBeDefined();
    });
  });

  describe('addSpectator', () => {
    it('adds spectator to a full room', () => {
      const room = service.createRoom({ name: 'R', gameType: GameType.Chess });
      for (let i = 0; i < 10; i++) {
        service.addPlayer(room.id, makePlayer(`s${i}`));
      }
      expect(service.addSpectator(room.id, makePlayer('spectator1'))).toBe('ok');
      expect(service.getRoom(room.id)!.spectators).toHaveLength(1);
    });

    it('returns not_found for unknown room', () => {
      expect(service.addSpectator('unknown', makePlayer('s1'))).toBe('not_found');
    });
  });

  describe('listRooms', () => {
    it('returns summaries of all rooms', () => {
      service.createRoom({ name: 'A', gameType: GameType.Chess });
      service.createRoom({ name: 'B', gameType: GameType.TicTacToe });
      const list = service.listRooms();
      expect(list).toHaveLength(2);
      expect(list.map((r) => r.name)).toEqual(expect.arrayContaining(['A', 'B']));
    });

    it('reflects correct player and spectator counts', () => {
      const room = service.createRoom({ name: 'R', gameType: GameType.Chess });
      service.addPlayer(room.id, makePlayer('s1'));
      service.addSpectator(room.id, makePlayer('spec1'));
      const summary = service.listRooms()[0];
      expect(summary.playerCount).toBe(1);
      expect(summary.spectatorCount).toBe(1);
    });
  });

  describe('closeRoom', () => {
    it('removes room from store', () => {
      const room = service.createRoom({ name: 'R', gameType: GameType.Chess });
      service.closeRoom(room.id);
      expect(service.getRoom(room.id)).toBeUndefined();
      expect(service.listRooms()).toHaveLength(0);
    });
  });
});
