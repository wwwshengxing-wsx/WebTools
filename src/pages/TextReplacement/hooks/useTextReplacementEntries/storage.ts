import type { HistoryEntry, TextReplacementEntry } from './types';
import { isClient } from './utils';

const ENTRIES_STORAGE_KEY = 'app.textReplacement.entries';
const HISTORY_STORAGE_KEY = 'app.textReplacement.history';

export const HISTORY_LIMIT = 50;

export function readEntriesFromStorage(): TextReplacementEntry[] {
  if (!isClient()) return [];

  try {
    const raw = window.localStorage.getItem(ENTRIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TextReplacementEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => typeof item.id === 'string')
      .map((item) => ({
        ...item,
        shortcut: item.shortcut ?? '',
        phrase: item.phrase ?? '',
        tags: Array.isArray((item as Partial<TextReplacementEntry>).tags)
          ? ((item as Partial<TextReplacementEntry>).tags ?? []).map((tag) => String(tag).trim()).filter(Boolean)
          : [],
      }));
  } catch (error) {
    console.warn('Failed to read text replacement entries', error);
    return [];
  }
}

export function readHistoryFromStorage(): HistoryEntry[] {
  if (!isClient()) return [];

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => typeof item.id === 'string' && Array.isArray(item.before) && Array.isArray(item.after))
      .slice(0, HISTORY_LIMIT)
      .map((item) => ({
        ...item,
        before: item.before.map((entry) => ({
          ...entry,
          tags: Array.isArray(entry.tags) ? entry.tags : [],
        })),
        after: item.after.map((entry) => ({
          ...entry,
          tags: Array.isArray(entry.tags) ? entry.tags : [],
        })),
      }));
  } catch (error) {
    console.warn('Failed to read text replacement history', error);
    return [];
  }
}

export function persistEntries(entries: TextReplacementEntry[]): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('Failed to persist text replacement entries', error);
  }
}

export function persistHistory(history: HistoryEntry[]): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to persist text replacement history', error);
  }
}

export function clearStoredData(): void {
  if (!isClient()) return;
  try {
    window.localStorage.removeItem(ENTRIES_STORAGE_KEY);
    window.localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear stored text replacement data', error);
  }
}
