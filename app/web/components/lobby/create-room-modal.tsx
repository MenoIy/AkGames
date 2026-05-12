'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Grid3X3, Loader2 } from 'lucide-react';
import { GameType } from '@akgames/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const GAME_TILES: { type: GameType; label: string; Icon: React.ElementType }[] = [
  { type: GameType.TicTacToe, label: 'Tic Tac Toe', Icon: Grid3X3 },
  { type: GameType.Chess, label: 'Chess', Icon: Crown },
];

interface CreateRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoomModal({ open, onOpenChange }: CreateRoomModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [gameType, setGameType] = useState<GameType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = name.trim().length > 0 && gameType !== null && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), gameType }),
      });
      if (!res.ok) throw new Error('Failed to create room');
      const { id } = (await res.json()) as { id: string };
      onOpenChange(false);
      router.push(`/game/${id}`);
    } catch {
      setError('Could not create room. Please try again.');
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setName('');
      setGameType(null);
      setError('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Create a Game Room</DialogTitle>
        </DialogHeader>

        {/* Room name */}
        <div className="space-y-1.5">
          <label className="text-sm text-slate-300">Room name</label>
          <input
            autoFocus
            type="text"
            placeholder="My awesome room"
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full bg-slate-700 border border-slate-600 text-white placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Game type grid */}
        <div className="space-y-1.5">
          <label className="text-sm text-slate-300">Game type</label>
          <div className="grid grid-cols-2 gap-3">
            {GAME_TILES.map(({ type, label, Icon }) => (
              <button
                key={type}
                onClick={() => setGameType(type)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${
                  gameType === type
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-8 h-8" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {/* Footer */}
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={() => handleOpenChange(false)}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-400 text-white font-medium px-4 py-2 rounded-lg transition-all text-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Room
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
