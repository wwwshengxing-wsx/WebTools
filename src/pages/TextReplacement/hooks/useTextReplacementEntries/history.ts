import { HISTORY_LIMIT } from './storage';
import type { HistoryEntry, HistoryEventType, TextReplacementEntry } from './types';
import { cloneEntries, generateId } from './utils';

export function createHistoryEntry(
  type: HistoryEventType,
  summary: string,
  before: TextReplacementEntry[],
  after: TextReplacementEntry[]
): HistoryEntry {
  return {
    id: generateId(),
    type,
    summary,
    timestamp: new Date().toISOString(),
    before: cloneEntries(before),
    after: cloneEntries(after),
  };
}

export function appendHistoryEntry(
  entry: HistoryEntry | null,
  setHistory: (updater: (prev: HistoryEntry[]) => HistoryEntry[]) => void
): void {
  if (!entry) return;
  setHistory((prev) => {
    const next = [entry, ...prev];
    return next.slice(0, HISTORY_LIMIT);
  });
}
