import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { GameGateway } from './game.gateway.js';
import type { RoomsService } from '../rooms/rooms.service.js';
import { SERVER_EVENTS } from '@akgames/events';
import { GameType } from '@akgames/types';

function makeSocket(id: string): Socket {
  return {
    id,
    emit: jest.fn(),
    join: jest.fn().mockResolvedValue(undefined),
    leave: jest.fn().mockResolvedValue(undefined),
  } as unknown as Socket;
}

function makeGateway() {
  const mockRoomsService = {
    getRoom: jest.fn().mockReturnValue({
      id: 'room1',
      name: 'Test',
      gameType: GameType.Chess,
      status: 'waiting',
      players: [{ socketId: 'socket1', displayName: 'Alice' }],
      spectators: [],
      createdAt: Date.now(),
    }),
    addPlayer: jest.fn().mockReturnValue('ok'),
    addSpectator: jest.fn().mockReturnValue('ok'),
    removePlayer: jest.fn(),
    removeSpectator: jest.fn(),
    listRooms: jest.fn().mockReturnValue([]),
  } as unknown as RoomsService;

  const gateway = new GameGateway(mockRoomsService);

  const emitFn = jest.fn();
  const exceptEmitFn = jest.fn();
  const exceptFn = jest.fn().mockReturnValue({ emit: exceptEmitFn });
  const toFn = jest.fn().mockReturnValue({ emit: emitFn, except: exceptFn });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (gateway as any)['server'] = { to: toFn };

  return { gateway, emitFn, mockRoomsService };
}

describe('GameGateway — handleChatSend', () => {
  let gateway: GameGateway;
  let emitFn: jest.Mock;
  let socket: Socket;

  beforeEach(() => {
    ({ gateway, emitFn } = makeGateway());
    socket = makeSocket('socket1');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (gateway as any).socketMeta.set('socket1', {
      roomId: 'room1',
      displayName: 'Alice',
      role: 'player',
    });
  });

  it('broadcasts chat:message to the room on valid send', () => {
    gateway.handleChatSend({ text: 'Hello!' }, socket);

    expect(emitFn).toHaveBeenCalledWith(
      SERVER_EVENTS.CHAT_MESSAGE,
      expect.objectContaining({
        type: 'user',
        text: 'Hello!',
        senderName: 'Alice',
        role: 'player',
      }),
    );
  });

  it('throws WsException when message exceeds 500 chars', () => {
    expect(() => gateway.handleChatSend({ text: 'a'.repeat(501) }, socket)).toThrow(WsException);
  });

  it('throws WsException on second send within 1s (rate limit)', () => {
    gateway.handleChatSend({ text: 'First' }, socket);
    expect(() => gateway.handleChatSend({ text: 'Second' }, socket)).toThrow(WsException);
  });

  it('throws WsException when socket is not in a room', () => {
    const stranger = makeSocket('stranger');
    expect(() => gateway.handleChatSend({ text: 'hi' }, stranger)).toThrow(WsException);
  });

  it('trims whitespace before sending', () => {
    gateway.handleChatSend({ text: '  trimmed  ' }, socket);
    expect(emitFn).toHaveBeenCalledWith(
      SERVER_EVENTS.CHAT_MESSAGE,
      expect.objectContaining({ text: 'trimmed' }),
    );
  });

  it('throws WsException for empty/whitespace-only text', () => {
    expect(() => gateway.handleChatSend({ text: '   ' }, socket)).toThrow(WsException);
  });
});

describe('GameGateway — handleJoin broadcasts presence', () => {
  it('emits GAME_PRESENCE after a new join', () => {
    const { gateway, emitFn } = makeGateway();
    const socket = makeSocket('socket2');

    gateway.handleJoin({ roomId: 'room1', displayName: 'Bob' }, socket);

    expect(emitFn).toHaveBeenCalledWith(SERVER_EVENTS.GAME_PRESENCE, expect.any(Object));
  });
});
