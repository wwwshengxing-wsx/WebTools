import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'app.storage.entries';

export interface StorageEntry {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

export interface UseStorageEntriesResult {
  entries: StorageEntry[];
  addEntry: (input: { key: string; value: string }) => void;
  updateEntry: (id: string, updates: { key: string; value: string }) => void;
  removeEntry: (id: string) => void;
  clearEntries: () => void;
}

const isClient = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function readEntriesFromStorage(): StorageEntry[] {
  if (!isClient) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StorageEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => typeof entry.id === 'string');
  } catch (error) {
    console.warn('Failed to parse storage entries', error);
    return [];
  }
}

function persistEntries(entries: StorageEntry[]): void {
  if (!isClient) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('Failed to persist storage entries', error);
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
}

export function useStorageEntries(): UseStorageEntriesResult {
  const [entries, setEntries] = useState<StorageEntry[]>(() => readEntriesFromStorage());

  useEffect(() => {
    persistEntries(entries);
  }, [entries]);

  const addEntry = useCallback((input: { key: string; value: string }) => {
    const trimmedKey = input.key.trim();
    const trimmedValue = input.value.trim();
    if (!trimmedKey && !trimmedValue) {
      return;
    }

    setEntries((prev) => {
      const now = new Date().toISOString();
      const existing = prev.find((entry) => entry.key === trimmedKey);
      if (existing) {
        return prev
          .map((entry) =>
            entry.id === existing.id
              ? { ...entry, key: trimmedKey, value: trimmedValue, updatedAt: now }
              : entry
          )
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      }

      const next: StorageEntry = {
        id: generateId(),
        key: trimmedKey,
        value: trimmedValue,
        updatedAt: now,
      };

      return [next, ...prev];
    });
  }, []);

  const updateEntry = useCallback((id: string, updates: { key: string; value: string }) => {
    setEntries((prev) => {
      const now = new Date().toISOString();
      const next = prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              key: updates.key.trim(),
              value: updates.value.trim(),
              updatedAt: now,
            }
          : entry
      );
      return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  return useMemo(
    () => ({ entries, addEntry, updateEntry, removeEntry, clearEntries }),
    [entries, addEntry, updateEntry, removeEntry, clearEntries]
  );
}
