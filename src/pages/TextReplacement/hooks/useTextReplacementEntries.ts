import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { serializeTextReplacementItems } from '../lib/xml';
import {
  NO_TAG_FILTER,
  type ComparisonPreviewState,
  type HistoryEntry,
  type ImportPreviewState,
  type SortBy,
  type SortOrder,
  type TextReplacementEntry,
  type UseTextReplacementEntriesResult,
} from './useTextReplacementEntries/types';
import {
  persistEntries,
  persistHistory,
  readEntriesFromStorage,
  readHistoryFromStorage,
  clearStoredData,
} from './useTextReplacementEntries/storage';
import {
  areEntryListsEqual,
  cloneEntries,
  generateId,
  normalizeTags,
  areTagsEqual,
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
  const [selectedTags, setSelectedTagsState] = useState<string[]>([]);
  const [importPreview, setImportPreview] = useState<ImportPreviewState | null>(null);
  const [comparisonPreview, setComparisonPreview] = useState<ComparisonPreviewState | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);

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

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    let hasEmptyTag = false;
    entries.forEach((entry) => {
      if (entry.tags.length === 0) {
        hasEmptyTag = true;
      }
      entry.tags.forEach((tag) => {
        if (tag.trim()) tagSet.add(tag);
      });
    });
    const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    if (hasEmptyTag) {
      tags.push(NO_TAG_FILTER);
    }
    return tags;
  }, [entries]);

  useEffect(() => {
    setSelectedTagsState((prev) => prev.filter((tag) => availableTags.includes(tag)));
  }, [availableTags]);

  const setSelectedTags = useCallback((tags: string[]) => {
    setSelectedTagsState(normalizeTags(tags));
  }, []);

  const toggleTagFilter = useCallback((tag: string) => {
    setSelectedTagsState((prev) => (prev.includes(tag) ? prev.filter((value) => value !== tag) : [...prev, tag]));
  }, []);

  const clearTagFilters = useCallback(() => {
    setSelectedTagsState([]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEntryIds([]);
  }, []);

  const toggleSelectionMode = useCallback((enabled?: boolean) => {
    setSelectionMode((prev) => {
      const next = typeof enabled === 'boolean' ? enabled : !prev;
      if (!next) {
        setSelectedEntryIds([]);
      }
      return next;
    });
  }, []);

  const toggleEntrySelection = useCallback((entryId: string) => {
    setSelectedEntryIds((prev) =>
      prev.includes(entryId) ? prev.filter((id) => id !== entryId) : [...prev, entryId]
    );
  }, []);

  const visibleEntries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const tagFilterActive = selectedTags.length > 0;

    const filtered = entries.filter((entry) => {
      if (tagFilterActive) {
        const entryTags = entry.tags;
        const matchesAllFilters = selectedTags.every((tag) => {
          if (tag === NO_TAG_FILTER) {
            return entryTags.length === 0;
          }
          return entryTags.includes(tag);
        });
        if (!matchesAllFilters) return false;
      }

      if (!term) return true;

      return (
        entry.shortcut.toLowerCase().includes(term) ||
        entry.phrase.toLowerCase().includes(term) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(term))
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
  }, [entries, searchTerm, selectedTags, sortBy, sortOrder]);

  useEffect(() => {
    setSelectedEntryIds((prev) => prev.filter((id) => entries.some((entry) => entry.id === id)));
  }, [entries]);

  useEffect(() => {
    setSelectedEntryIds((prev) => prev.filter((id) => visibleEntries.some((entry) => entry.id === id)));
  }, [visibleEntries]);

  const selectAllVisibleEntries = useCallback(() => {
    setSelectedEntryIds(visibleEntries.map((entry) => entry.id));
  }, [visibleEntries]);

  const appendHistory = useCallback(
    (record: HistoryEntry | null) => {
      appendHistoryEntry(record, setHistoryEntries);
    },
    []
  );

  const saveEntry = useCallback(
    (input: { id?: string; shortcut: string; phrase: string; tags: string[] }) => {
      const trimmedShortcut = input.shortcut.trim();
      const trimmedPhrase = input.phrase.trim();
      const normalizedTags = normalizeTags(input.tags ?? []);

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
            existing.phrase === trimmedPhrase &&
            areTagsEqual(existing.tags, normalizedTags)
          ) {
            return prev;
          }

          nextEntries = prev.map((entry) =>
            entry.id === input.id
              ? {
                  ...entry,
                  shortcut: trimmedShortcut,
                  phrase: trimmedPhrase,
                  tags: normalizedTags,
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
                    tags: normalizedTags,
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
              tags: normalizedTags,
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
      setSelectedEntryIds((prev) => prev.filter((entryId) => entryId !== id));
    },
    [appendHistory]
  );

  const deleteSelectedEntries = useCallback(() => {
    if (selectedEntryIds.length === 0) return;
    const idsToDelete = new Set(selectedEntryIds);
    setEntries((prev) => {
      if (idsToDelete.size === 0) return prev;
      const before = cloneEntries(prev);
      const nextEntries = prev.filter((entry) => !idsToDelete.has(entry.id));
      if (nextEntries.length === prev.length) {
        return prev;
      }
      const count = idsToDelete.size;
      const history = createHistoryEntry(
        'delete',
        `Deleted ${count} entr${count === 1 ? 'y' : 'ies'} (batch)`,
        before,
        nextEntries
      );
      appendHistory(history);
      return nextEntries;
    });
    clearSelection();
    setSelectionMode(false);
  }, [appendHistory, clearSelection, selectedEntryIds]);

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
        tags: entry.tags ?? [],
      }));
    return serializeTextReplacementItems(items);
  }, []);

  const addTagToSelectedEntries = useCallback(
    (tag: string) => {
      const normalized = normalizeTags([tag])[0];
      if (!normalized || selectedEntryIds.length === 0) return;
      const selectedSet = new Set(selectedEntryIds);
      const now = new Date().toISOString();

      setEntries((prev) => {
        const before = cloneEntries(prev);
        let changed = false;
        const nextEntries = prev.map((entry) => {
          if (!selectedSet.has(entry.id)) return entry;
          if (entry.tags.includes(normalized)) return entry;
          changed = true;
          return {
            ...entry,
            tags: [...entry.tags, normalized],
            updatedAt: now,
          };
        });

        if (!changed) return prev;

        const count = selectedSet.size;
        const history = createHistoryEntry(
          'update',
          `Added tag "${normalized}" to ${count} entr${count === 1 ? 'y' : 'ies'}`,
          before,
          nextEntries
        );
        appendHistory(history);
        return nextEntries;
      });
    },
    [appendHistory, selectedEntryIds]
  );

  const clearAllEntries = useCallback(() => {
    setEntries([]);
    setHistoryEntries([]);
    setImportPreview(null);
    setComparisonPreview(null);
    setSearchTerm('');
    entriesRef.current = [];
    historyRef.current = [];
    comparisonFileEntriesRef.current = [];
    comparisonPreviewRef.current = null;
    setSelectedTagsState([]);
    clearStoredData();
  }, []);

  return {
    entries,
    visibleEntries,
    sortBy,
    sortOrder,
    searchTerm,
    availableTags,
    selectedTags,
    historyEntries,
    importPreview,
    comparisonPreview,
    setSearchTerm,
    setSortBy,
    toggleSortOrder,
    setSelectedTags,
    toggleTagFilter,
    clearTagFilters,
    selectionMode,
    selectedEntryIds,
    toggleSelectionMode,
    toggleEntrySelection,
    selectAllVisibleEntries,
    clearSelection,
    saveEntry,
    deleteEntry,
    deleteSelectedEntries,
    addTagToSelectedEntries,
    prepareImportPreview,
    toggleImportSelection,
    selectAllImportItems,
    confirmImportSelection,
    cancelImportPreview,
    undoHistory,
    exportEntriesAsXml,
    clearAllEntries,
    prepareComparisonPreview,
    closeComparisonPreview,
    addComparisonEntry,
    applyComparisonEntry,
    removeComparisonEntry,
  };
}
