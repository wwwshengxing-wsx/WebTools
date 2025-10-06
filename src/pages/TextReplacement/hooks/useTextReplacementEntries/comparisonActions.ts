import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { ParsedTextReplacementItem } from '../../lib/xml';
import {
  type ComparisonFileEntry,
  buildComparisonItems,
  createComparisonPreview,
  sanitizeComparisonFileEntries,
  updateComparisonState,
} from './comparison';
import { cloneEntries, generateId, normalizeTags } from './utils';
import { createHistoryEntry } from './history';
import type {
  ComparisonPreviewState,
  HistoryEntry,
  TextReplacementEntry,
} from './types';

export interface ComparisonDependencies {
  entriesRef: MutableRefObject<TextReplacementEntry[]>;
  setEntries: Dispatch<SetStateAction<TextReplacementEntry[]>>;
  setComparisonPreview: Dispatch<SetStateAction<ComparisonPreviewState | null>>;
  comparisonFileEntriesRef: MutableRefObject<ComparisonFileEntry[]>;
  comparisonPreviewRef: MutableRefObject<ComparisonPreviewState | null>;
  refreshComparisonPreview: (entriesSnapshot: TextReplacementEntry[]) => void;
  appendHistory: (entry: HistoryEntry | null) => void;
}

export function createComparisonActions({
  entriesRef,
  setEntries,
  setComparisonPreview,
  comparisonFileEntriesRef,
  comparisonPreviewRef,
  refreshComparisonPreview,
  appendHistory,
}: ComparisonDependencies) {
  const prepareComparisonPreview = (items: ParsedTextReplacementItem[], fileName: string) => {
    const sanitized = sanitizeComparisonFileEntries(items);
    comparisonFileEntriesRef.current = sanitized;
    const comparisonItems = buildComparisonItems(entriesRef.current, sanitized);
    const state = createComparisonPreview(fileName, comparisonItems);
    comparisonPreviewRef.current = state;
    setComparisonPreview(state);
  };

  const closeComparisonPreview = () => {
    comparisonFileEntriesRef.current = [];
    comparisonPreviewRef.current = null;
    setComparisonPreview(null);
  };

  const addComparisonEntry = (shortcut: string) => {
    const fileEntry = comparisonFileEntriesRef.current.find((entry) => entry.shortcut === shortcut);
    if (!fileEntry) return;
    const fileName = comparisonPreviewRef.current?.fileName ?? 'comparison file';
    let snapshot: TextReplacementEntry[] | null = null;

    setEntries((prevEntries) => {
      const existing = prevEntries.find((entry) => entry.shortcut === shortcut);
      if (existing) {
        snapshot = prevEntries;
        return prevEntries;
      }

      const before = cloneEntries(prevEntries);
      const now = new Date().toISOString();
      const created: TextReplacementEntry = {
        id: generateId(),
        shortcut: fileEntry.shortcut,
        phrase: fileEntry.phrase,
        tags: normalizeTags(fileEntry.tags ?? []),
        createdAt: now,
        updatedAt: now,
        source: 'import',
      };
      const nextEntries = [created, ...prevEntries];
      snapshot = nextEntries;
      const history = createHistoryEntry(
        'import',
        `Added "${fileEntry.shortcut}" from ${fileName}`,
        before,
        nextEntries
      );
      appendHistory(history);
      return nextEntries;
    });

    if (snapshot) {
      refreshComparisonPreview(snapshot);
    }
  };

  const applyComparisonEntry = (shortcut: string) => {
    const fileEntry = comparisonFileEntriesRef.current.find((entry) => entry.shortcut === shortcut);
    if (!fileEntry) return;
    const fileName = comparisonPreviewRef.current?.fileName ?? 'comparison file';
    let snapshot: TextReplacementEntry[] | null = null;

    setEntries((prevEntries) => {
      const target = prevEntries.find((entry) => entry.shortcut === shortcut);
      if (!target) {
        snapshot = prevEntries;
        return prevEntries;
      }

      if (target.phrase === fileEntry.phrase) {
        snapshot = prevEntries;
        return prevEntries;
      }

      const before = cloneEntries(prevEntries);
      const now = new Date().toISOString();
      const normalizedTags = normalizeTags(fileEntry.tags ?? []);
      const nextEntries = prevEntries.map((entry) =>
        entry.id === target.id
          ? {
              ...entry,
              phrase: fileEntry.phrase,
              tags: normalizedTags,
              updatedAt: now,
            }
          : entry
      );
      snapshot = nextEntries;
      const history = createHistoryEntry(
        'import',
        `Applied "${fileEntry.shortcut}" from ${fileName}`,
        before,
        nextEntries
      );
      appendHistory(history);
      return nextEntries;
    });

    if (snapshot) {
      refreshComparisonPreview(snapshot);
    }
  };

  const removeComparisonEntry = (shortcut: string) => {
    const fileName = comparisonPreviewRef.current?.fileName ?? 'comparison file';
    let snapshot: TextReplacementEntry[] | null = null;

    setEntries((prevEntries) => {
      const target = prevEntries.find((entry) => entry.shortcut === shortcut);
      if (!target) {
        snapshot = prevEntries;
        return prevEntries;
      }

      const before = cloneEntries(prevEntries);
      const nextEntries = prevEntries.filter((entry) => entry.id !== target.id);
      snapshot = nextEntries;
      const history = createHistoryEntry(
        'delete',
        `Removed "${target.shortcut}" while comparing against ${fileName}`,
        before,
        nextEntries
      );
      appendHistory(history);
      return nextEntries;
    });

    if (snapshot) {
      refreshComparisonPreview(snapshot);
    }
  };

  return {
    prepareComparisonPreview,
    closeComparisonPreview,
    addComparisonEntry,
    applyComparisonEntry,
    removeComparisonEntry,
  };
}

export function refreshComparisonState(
  setComparisonPreview: Dispatch<SetStateAction<ComparisonPreviewState | null>>,
  comparisonFileEntriesRef: MutableRefObject<ComparisonFileEntry[]>,
  comparisonPreviewRef: MutableRefObject<ComparisonPreviewState | null>,
  entriesSnapshot: TextReplacementEntry[]
): void {
  setComparisonPreview((prev) => {
    const next = updateComparisonState(prev, comparisonFileEntriesRef.current, entriesSnapshot);
    comparisonPreviewRef.current = next;
    return next;
  });
}
