'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { RoomSummary, RoomClosedPayload } from '@akgames/types';
import { SERVER_EVENTS } from '@akgames/events';

export function useLobbySocket() {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    const socket: Socket = io(`${apiUrl}/lobby`);

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on(SERVER_EVENTS.ROOM_LIST, (list: RoomSummary[]) => {
      setRooms(list);
    });

    socket.on(SERVER_EVENTS.ROOM_CREATED, (room: RoomSummary) => {
      setRooms((prev) => [...prev, room]);
    });

    socket.on(SERVER_EVENTS.ROOM_UPDATED, (updated: RoomSummary) => {
      setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    });

    socket.on(SERVER_EVENTS.ROOM_CLOSED, ({ id }: RoomClosedPayload) => {
      setRooms((prev) => prev.filter((r) => r.id !== id));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { rooms, connected };
}
