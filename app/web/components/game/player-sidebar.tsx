import type { Player } from '@akgames/types';

interface PlayerSidebarProps {
  players: Player[];
  spectators: Player[];
  currentDisplayName: string;
}

function PlayerEntry({ player, isSelf }: { player: Player; isSelf: boolean }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-700/50">
      <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
      <span
        className={`text-sm truncate ${isSelf ? 'text-purple-300 font-medium' : 'text-slate-300'}`}
      >
        {player.displayName}
        {isSelf && <span className="text-xs text-slate-500 ml-1">(you)</span>}
      </span>
    </div>
  );
}

export function PlayerSidebar({ players, spectators, currentDisplayName }: PlayerSidebarProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-1">
          Players ({players.length}/10)
        </p>
        {players.length === 0 ? (
          <p className="text-xs text-slate-600 px-2">No players yet</p>
        ) : (
          players.map((p) => (
            <PlayerEntry
              key={p.socketId}
              player={p}
              isSelf={p.displayName === currentDisplayName}
            />
          ))
        )}
      </div>

      {spectators.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-1">
            Spectators ({spectators.length})
          </p>
          {spectators.map((p) => (
            <PlayerEntry
              key={p.socketId}
              player={p}
              isSelf={p.displayName === currentDisplayName}
            />
          ))}
        </div>
      )}
    </div>
  );
}
