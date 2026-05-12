'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';

interface DisplayNameInputProps {
  displayName: string;
  onSave: (name: string) => void;
}

export function DisplayNameInput({ displayName, onSave }: DisplayNameInputProps) {
  const [editing, setEditing] = useState(!displayName);
  const [value, setValue] = useState(displayName);

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setEditing(false);
  };

  if (!editing && displayName) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <span>
          Playing as <span className="text-purple-400 font-medium">{displayName}</span>
        </span>
        <button
          onClick={() => {
            setValue(displayName);
            setEditing(true);
          }}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        type="text"
        placeholder="Enter your display name"
        maxLength={20}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        className="bg-slate-700 border border-slate-600 text-white placeholder:text-slate-500 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-purple-500 transition-colors w-56"
      />
      <button
        onClick={handleSave}
        disabled={!value.trim()}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:text-slate-400 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
      >
        Save
      </button>
    </div>
  );
}
