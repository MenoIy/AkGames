'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ChatMessage, GameJoinedPayload, GamePresencePayload, Player } from '@akgames/types';
import { CLIENT_EVENTS, SERVER_EVENTS } from '@akgames/events';

interface UseGameSocketOptions {
  roomId: string;
  displayName: string;
}

export function useGameSocket({ roomId, displayName }: UseGameSocketOptions) {
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [spectators, setSpectators] = useState<Player[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [role, setRole] = useState<'player' | 'spectator' | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const emitRef = useRef<(event: string, data?: unknown) => void>(() => {});

  useEffect(() => {
    if (!displayName || !roomId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    const socket: Socket = io(`${apiUrl}/game`);
    socketRef.current = socket;
    emitRef.current = (event, data) => socket.emit(event, data);

    socket.on('connect', () => {
      setConnected(true);
      socket.emit(CLIENT_EVENTS.GAME_JOIN, { roomId, displayName });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on(SERVER_EVENTS.GAME_JOINED, (payload: GameJoinedPayload) => {
      setPlayers(payload.room.players);
      setSpectators(payload.room.spectators);
      setMessages(payload.messages);
      setRole(payload.role);
    });

    socket.on(SERVER_EVENTS.GAME_PRESENCE, (payload: GamePresencePayload) => {
      setPlayers(payload.players);
      setSpectators(payload.spectators);
    });

    socket.on(SERVER_EVENTS.CHAT_SYSTEM, (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on(SERVER_EVENTS.CHAT_MESSAGE, (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit(CLIENT_EVENTS.GAME_LEAVE);
      socket.disconnect();
    };
  }, [roomId, displayName]);

  return { connected, players, spectators, messages, role, emit: emitRef };
}
