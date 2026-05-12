'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad2, HelpCircle, Plus, Wifi, WifiOff } from 'lucide-react';
import { CreateRoomModal } from '../components/lobby/create-room-modal';
import { DisplayNameInput } from '../components/lobby/display-name-input';
import { RoomCard } from '../components/lobby/room-card';
import { useDisplayName } from '../hooks/use-display-name';
import { useLobbySocket } from '../hooks/use-lobby-socket';

export default function HomePage() {
  const router = useRouter();
  const { displayName, setDisplayName } = useDisplayName();
  const { rooms, connected } = useLobbySocket();
  const [modalOpen, setModalOpen] = useState(false);

  const handleJoin = (roomId: string) => {
    if (!displayName) return;
    router.push(`/game/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-purple-400" />
            <span className="text-white font-bold text-lg">AkGames</span>
          </div>
          <div className="flex items-center gap-4">
            <DisplayNameInput displayName={displayName} onSave={setDisplayName} />
            <Link
              href="/help"
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Game Rooms</h1>
            <div className="flex items-center gap-1.5 mt-1 text-sm">
              {connected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-400">Connecting…</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            disabled={!displayName}
            title={!displayName ? 'Set a display name first' : 'Create a new game room'}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-400 text-white font-medium px-4 py-2 rounded-lg transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Game
          </button>
        </div>

        {/* Room list */}
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Gamepad2 className="w-16 h-16 mb-4 text-slate-600" />
            <p className="text-lg font-medium">No rooms yet</p>
            <p className="text-sm mt-1">Create the first game room!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onClick={handleJoin} />
            ))}
          </div>
        )}
      </main>

      <CreateRoomModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
