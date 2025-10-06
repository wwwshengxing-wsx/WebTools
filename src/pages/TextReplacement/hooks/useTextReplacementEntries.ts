import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { serializeTextReplacementItems } from '../lib/xml';
import type {
  ComparisonPreviewState,
  HistoryEntry,
  ImportPreviewState,
  SortBy,
  SortOrder,
  TextReplacementEntry,
  UseTextReplacementEntriesResult,
} from './useTextReplacementEntries/types';
import {
  persistEntries,
  persistHistory,
  readEntriesFromStorage,
  readHistoryFromStorage,
} from './useTextReplacementEntries/storage';
import {
  areEntryListsEqual,
  cloneEntries,
  generateId,
} from './useTextReplacementEntries/utils';
import { appendHistoryEntry, createHistoryEntry } from './useTextReplacementEntries/history';
import {
  refreshComparisonState,
  createComparisonActions,
} from './useTextReplacementEntries/comparisonActions';
import { createImportPreviewActions } from './useTextReplacementEntries/importPreview';
import type { ComparisonFileEntry } from './useTextReplacementEntries/comparison';

export type {
  ComparisonItem,
  ComparisonPreviewState,
  ComparisonStatus,
  HistoryEntry,
  ImportPreviewItem,
  ImportPreviewState,
  SortBy,
  SortOrder,
  TextReplacementEntry,
  UseTextReplacementEntriesResult,
} from './useTextReplacementEntries/types';

export function useTextReplacementEntries(): UseTextReplacementEntriesResult {
  const [entries, setEntries] = useState<TextReplacementEntry[]>(() => readEntriesFromStorage());
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(() => readHistoryFromStorage());
  const [sortBy, setSortByState] = useState<SortBy>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [importPreview, setImportPreview] = useState<ImportPreviewState | null>(null);
  const [comparisonPreview, setComparisonPreview] = useState<ComparisonPreviewState | null>(null);

  const entriesRef = useRef(entries);
  const historyRef = useRef(historyEntries);
  const comparisonFileEntriesRef = useRef<ComparisonFileEntry[]>([]);
  const comparisonPreviewRef = useRef<ComparisonPreviewState | null>(null);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    historyRef.current = historyEntries;
  }, [historyEntries]);

  useEffect(() => {
    persistEntries(entries);
  }, [entries]);

  useEffect(() => {
    persistHistory(historyEntries);
  }, [historyEntries]);

  useEffect(() => {
    comparisonPreviewRef.current = comparisonPreview;
  }, [comparisonPreview]);

  const setSortBy = useCallback((nextSortBy: SortBy) => {
    setSortByState(nextSortBy);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const visibleEntries = useMemo(() => {
    const filtered = entries.filter((entry) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.trim().toLowerCase();
      return (
        entry.shortcut.toLowerCase().includes(term) ||
        entry.phrase.toLowerCase().includes(term)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'updatedAt') {
        return a.updatedAt.localeCompare(b.updatedAt);
      }

      const first = a[sortBy] ?? '';
      const second = b[sortBy] ?? '';
      return first.localeCompare(second, undefined, { sensitivity: 'base' });
    });

    return sortOrder === 'desc' ? sorted.reverse() : sorted;
  }, [entries, searchTerm, sortBy, sortOrder]);

  const appendHistory = useCallback(
    (record: HistoryEntry | null) => {
      appendHistoryEntry(record, setHistoryEntries);
    },
    []
  );

  const saveEntry = useCallback(
    (input: { id?: string; shortcut: string; phrase: string }) => {
      const trimmedShortcut = input.shortcut.trim();
      const trimmedPhrase = input.phrase.trim();
      if (!trimmedShortcut && !trimmedPhrase) {
        return;
      }

      setEntries((prev) => {
        const before = cloneEntries(prev);
        const now = new Date().toISOString();
        let nextEntries = prev;
        let history: HistoryEntry | null = null;

        if (input.id) {
          const index = prev.findIndex((entry) => entry.id === input.id);
          if (index === -1) {
            return prev;
          }

          const existing = prev[index];
          if (
            existing.shortcut === trimmedShortcut &&
            existing.phrase === trimmedPhrase
          ) {
            return prev;
          }

          nextEntries = prev.map((entry) =>
            entry.id === input.id
              ? {
                  ...entry,
                  shortcut: trimmedShortcut,
                  phrase: trimmedPhrase,
                  updatedAt: now,
                }
              : entry
          );

          history = createHistoryEntry(
            'update',
            `Updated "${existing.shortcut}"`,
            before,
            nextEntries
          );
        } else {
          const duplicate = prev.find((entry) => entry.shortcut === trimmedShortcut);
          if (duplicate) {
            const updated = prev.map((entry) =>
              entry.id === duplicate.id
                ? {
                    ...entry,
                    phrase: trimmedPhrase,
                    updatedAt: now,
                  }
                : entry
            );
            history = createHistoryEntry(
              'update',
              `Updated "${duplicate.shortcut}"`,
              before,
              updated
            );
            nextEntries = updated;
          } else {
            const created: TextReplacementEntry = {
              id: generateId(),
              shortcut: trimmedShortcut,
              phrase: trimmedPhrase,
              source: 'manual',
              createdAt: now,
              updatedAt: now,
            };
            nextEntries = [created, ...prev];
            history = createHistoryEntry(
              'create',
              `Created "${created.shortcut}"`,
              before,
              nextEntries
            );
          }
        }

        appendHistory(history);
        return nextEntries;
      });
    },
    [appendHistory]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const target = prev.find((entry) => entry.id === id);
        if (!target) return prev;
        const before = cloneEntries(prev);
        const nextEntries = prev.filter((entry) => entry.id !== id);
        const history = createHistoryEntry(
          'delete',
          `Deleted "${target.shortcut}"`,
          before,
          nextEntries
        );
        appendHistory(history);
        return nextEntries;
      });
    },
    [appendHistory]
  );

  const {
    prepareImportPreview,
    toggleImportSelection,
    selectAllImportItems,
    confirmImportSelection,
    cancelImportPreview,
  } = useMemo(
    () =>
      createImportPreviewActions({
        entriesRef,
        setEntries,
        setImportPreview,
        appendHistory,
      }),
    [appendHistory]
  );

  const undoHistory = useCallback(
    (historyEntryId: string) => {
      const target = historyRef.current.find((entry) => entry.id === historyEntryId);
      if (!target) return;

      setEntries((prev) => {
        const before = cloneEntries(prev);
        const nextEntries = cloneEntries(target.before);
        if (areEntryListsEqual(before, nextEntries)) {
          return prev;
        }
        const summary = `Reverted ${target.type} change`;
        const history = createHistoryEntry('undo', summary, before, nextEntries);
        appendHistory(history);
        return nextEntries;
      });
    },
    [appendHistory]
  );

  const refreshComparisonPreview = useCallback(
    (entriesSnapshot: TextReplacementEntry[]) => {
      refreshComparisonState(
        setComparisonPreview,
        comparisonFileEntriesRef,
        comparisonPreviewRef,
        entriesSnapshot
      );
    },
    []
  );

  const {
    prepareComparisonPreview,
    closeComparisonPreview,
    addComparisonEntry,
    applyComparisonEntry,
    removeComparisonEntry,
  } = useMemo(
    () =>
      createComparisonActions({
        entriesRef,
        setEntries,
        setComparisonPreview,
        comparisonFileEntriesRef,
        comparisonPreviewRef,
        refreshComparisonPreview,
        appendHistory,
      }),
    [appendHistory, refreshComparisonPreview]
  );

  const exportEntriesAsXml = useCallback(() => {
    const items = [...entriesRef.current]
      .sort((a, b) => a.shortcut.localeCompare(b.shortcut, undefined, { sensitivity: 'base' }))
      .map((entry) => ({
        shortcut: entry.shortcut,
        phrase: entry.phrase,
      }));
    return serializeTextReplacementItems(items);
  }, []);

  return {
    entries,
    visibleEntries,
    sortBy,
    sortOrder,
    searchTerm,
    historyEntries,
    importPreview,
    comparisonPreview,
    setSearchTerm,
    setSortBy,
    toggleSortOrder,
    saveEntry,
    deleteEntry,
    prepareImportPreview,
    toggleImportSelection,
    selectAllImportItems,
    confirmImportSelection,
    cancelImportPreview,
    undoHistory,
    exportEntriesAsXml,
    prepareComparisonPreview,
    closeComparisonPreview,
    addComparisonEntry,
    applyComparisonEntry,
    removeComparisonEntry,
  };
}
