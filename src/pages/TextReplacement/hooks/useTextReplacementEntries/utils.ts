import type { TextReplacementEntry } from './types';

export function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 11);
}

export function cloneEntries(entries: TextReplacementEntry[]): TextReplacementEntry[] {
  return entries.map((entry) => ({ ...entry }));
}

export function areEntryListsEqual(
  first: TextReplacementEntry[],
  second: TextReplacementEntry[]
): boolean {
  if (first.length !== second.length) return false;
  for (let index = 0; index < first.length; index += 1) {
    const a = first[index];
    const b = second[index];
    if (!b) return false;
    if (
      a.id !== b.id ||
      a.shortcut !== b.shortcut ||
      a.phrase !== b.phrase ||
      a.createdAt !== b.createdAt ||
      a.updatedAt !== b.updatedAt ||
      a.source !== b.source
    ) {
      return false;
    }
  }
  return true;
}
