'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { ChatPanel } from '../../../components/game/chat-panel';
import { PlayerSidebar } from '../../../components/game/player-sidebar';
import { useDisplayName } from '../../../hooks/use-display-name';
import { useGameSocket } from '../../../hooks/use-game-socket';

export default function GameRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const { displayName } = useDisplayName();
  const { connected, players, spectators, messages, role, emit } = useGameSocket({
    roomId,
    displayName,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Gamepad2 className="w-5 h-5 text-purple-400" />
            <span className="text-white font-semibold text-sm">Game Room</span>
            <span className="text-slate-500 text-xs font-mono">{roomId}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-slate-400">{displayName}</span>
            {role && (
              <span className="text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">{role}</span>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full px-4 py-4 gap-4">
        {/* Game area */}
        <div className="flex-1 bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center">
          <div className="text-center text-slate-600">
            <Gamepad2 className="w-16 h-16 mx-auto mb-3" />
            <p className="text-sm font-medium">Game area</p>
            <p className="text-xs mt-1">Coming soon</p>
          </div>
        </div>

        {/* Right panel: chat + sidebar */}
        <div className="w-72 shrink-0 flex flex-col gap-4">
          {/* Chat panel */}
          <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden min-h-0">
            <ChatPanel messages={messages} emit={emit} />
          </div>

          {/* Player sidebar */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
            <PlayerSidebar
              players={players}
              spectators={spectators}
              currentDisplayName={displayName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
