'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChatMessage } from '@akgames/types';
import { CLIENT_EVENTS } from '@akgames/events';
import { Send } from 'lucide-react';

interface ChatPanelProps {
  messages: ChatMessage[];
  emit: React.MutableRefObject<(event: string, data?: unknown) => void>;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function ChatPanel({ messages, emit }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [sendDisabled, setSendDisabled] = useState(false);
  const [unread, setUnread] = useState(0);
  const [focused, setFocused] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(messages.length);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    const newCount = messages.length - prevCountRef.current;
    if (newCount > 0 && !focused) {
      setUnread((u) => u + newCount);
    }
    prevCountRef.current = messages.length;
  }, [messages, focused]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || sendDisabled) return;
    emit.current(CLIENT_EVENTS.CHAT_SEND, { text });
    setInput('');
    setSendDisabled(true);
    setTimeout(() => setSendDisabled(false), 1000);
  }, [input, sendDisabled, emit]);

  return (
    <div
      className="flex flex-col h-full"
      onFocus={() => {
        setFocused(true);
        setUnread(0);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setFocused(false);
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
        <span className="text-sm font-medium text-slate-300">Chat</span>
        {unread > 0 && (
          <span className="bg-purple-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {unread}
          </span>
        )}
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-xs text-slate-600 text-center mt-4">No messages yet</p>
        )}
        {messages.map((msg, i) =>
          msg.type === 'system' ? (
            <div key={i} className="text-xs italic text-slate-500 text-center">
              {msg.text}
            </div>
          ) : (
            <div key={i} className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-300">{msg.senderName}</span>
                {msg.role && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      msg.role === 'player'
                        ? 'bg-purple-900/60 text-purple-300'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {msg.role}
                  </span>
                )}
                <span className="text-[10px] text-slate-600 ml-auto">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="text-sm text-slate-200 break-words">{msg.text}</p>
            </div>
          ),
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t border-slate-700">
        <input
          type="text"
          value={input}
          maxLength={500}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send();
          }}
          placeholder="Type a message…"
          className="flex-1 bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={send}
          disabled={sendDisabled || !input.trim()}
          className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
