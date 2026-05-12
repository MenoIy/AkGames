'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'akgames:displayName';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) ?? '';
}

function getServerSnapshot() {
  return '';
}

export function useDisplayName() {
  const displayName = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setDisplayName = useCallback((name: string) => {
    localStorage.setItem(STORAGE_KEY, name);
    // Trigger re-render for same-tab updates
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  }, []);

  return { displayName, setDisplayName, loaded: true };
}
