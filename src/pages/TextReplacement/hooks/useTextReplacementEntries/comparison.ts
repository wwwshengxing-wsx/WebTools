import type {
  ComparisonItem,
  ComparisonPreviewState,
  ComparisonStatus,
  TextReplacementEntry,
} from './types';
import type { ParsedTextReplacementItem } from '../../lib/xml';
import { areTagsEqual, normalizeTags } from './utils';

export interface ComparisonFileEntry {
  shortcut: string;
  phrase: string;
  tags: string[];
}

const comparisonStatusOrder: Record<ComparisonStatus, number> = {
  modified: 0,
  fileOnly: 1,
  currentOnly: 2,
  identical: 3,
};

export function sanitizeComparisonFileEntries(
  items: ParsedTextReplacementItem[]
): ComparisonFileEntry[] {
  const byShortcut = new Map<string, ComparisonFileEntry>();
  items.forEach((item) => {
    const shortcut = item.shortcut.trim();
    const phrase = item.phrase.trim();
    if (!shortcut && !phrase) return;
    byShortcut.set(shortcut, {
      shortcut,
      phrase,
      tags: normalizeTags(item.tags ?? []),
    });
  });

  return Array.from(byShortcut.values());
}

export function buildComparisonItems(
  currentEntries: TextReplacementEntry[],
  fileEntries: ComparisonFileEntry[]
): ComparisonItem[] {
  const currentByShortcut = new Map<string, TextReplacementEntry>();
  currentEntries.forEach((entry) => {
    currentByShortcut.set(entry.shortcut.trim(), entry);
  });

  const fileByShortcut = new Map<string, ComparisonFileEntry>();
  fileEntries.forEach((entry) => {
    fileByShortcut.set(entry.shortcut, entry);
  });

  const shortcuts = new Set<string>();
  currentByShortcut.forEach((_, key) => shortcuts.add(key));
  fileByShortcut.forEach((_, key) => shortcuts.add(key));

  const items: ComparisonItem[] = [];
  let index = 0;

  shortcuts.forEach((shortcutKey) => {
    const currentEntry = currentByShortcut.get(shortcutKey) ?? null;
    const fileEntry = fileByShortcut.get(shortcutKey) ?? null;
    if (!currentEntry && !fileEntry) return;

    let status: ComparisonStatus;
    if (currentEntry && fileEntry) {
      const phraseMatches = currentEntry.phrase === fileEntry.phrase;
      const tagsMatch = areTagsEqual(currentEntry.tags ?? [], normalizeTags(fileEntry.tags ?? []));
      status = phraseMatches && tagsMatch ? 'identical' : 'modified';
    } else if (fileEntry) {
      status = 'fileOnly';
    } else {
      status = 'currentOnly';
    }

    const displayShortcut = fileEntry?.shortcut ?? currentEntry?.shortcut ?? shortcutKey;
    const id = currentEntry?.id ?? `compare-${index}-${displayShortcut || 'blank'}`;
    items.push({
      id,
      shortcut: displayShortcut,
      status,
      currentEntry,
      fileEntry,
    });
    index += 1;
  });

  items.sort((a, b) => {
    const statusDifference = comparisonStatusOrder[a.status] - comparisonStatusOrder[b.status];
    if (statusDifference !== 0) return statusDifference;
    return (a.shortcut || '').localeCompare(b.shortcut || '', undefined, {
      sensitivity: 'base',
    });
  });

  return items;
}

export function updateComparisonState(
  prev: ComparisonPreviewState | null,
  fileEntries: ComparisonFileEntry[],
  entriesSnapshot: TextReplacementEntry[]
): ComparisonPreviewState | null {
  if (!prev) return prev;
  const items = buildComparisonItems(entriesSnapshot, fileEntries);
  return createComparisonPreview(prev.fileName, items);
}

export function createComparisonPreview(
  fileName: string,
  items: ComparisonItem[]
): ComparisonPreviewState {
  const differenceCount = countDifferences(items);
  return {
    fileName,
    items,
    differenceCount,
  };
}

export function countDifferences(items: ComparisonItem[]): number {
  return items.filter((item) => item.status !== 'identical').length;
}
