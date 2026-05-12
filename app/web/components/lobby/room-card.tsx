import type { RoomSummary } from '@akgames/types';
import { Users } from 'lucide-react';

const STATUS_BADGE: Record<RoomSummary['status'], { label: string; className: string }> = {
  waiting: { label: 'Waiting', className: 'bg-green-500' },
  in_progress: { label: 'In Progress', className: 'bg-yellow-500' },
};

const GAME_TYPE_LABEL: Record<string, string> = {
  tic_tac_toe: 'Tic Tac Toe',
  chess: 'Chess',
};

interface RoomCardProps {
  room: RoomSummary;
  onClick: (id: string) => void;
}

export function RoomCard({ room, onClick }: RoomCardProps) {
  const badge = STATUS_BADGE[room.status];

  return (
    <button
      onClick={() => onClick(room.id)}
      className="w-full text-left bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-800/70 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="font-semibold text-white truncate">{room.name}</span>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full text-white ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span className="text-purple-400">{GAME_TYPE_LABEL[room.gameType] ?? room.gameType}</span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {room.playerCount}/10
        </span>
      </div>
    </button>
  );
}
