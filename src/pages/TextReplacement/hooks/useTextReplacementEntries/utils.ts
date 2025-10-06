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
  return entries.map((entry) => ({
    ...entry,
    tags: [...(entry.tags ?? [])],
  }));
}

export function normalizeTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)));
}

export function areTagsEqual(first: string[], second: string[]): boolean {
  if (first.length !== second.length) return false;
  const sortedA = [...first].sort();
  const sortedB = [...second].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
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
