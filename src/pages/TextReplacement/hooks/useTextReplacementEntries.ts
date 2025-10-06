import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type ParsedTextReplacementItem,
  serializeTextReplacementItems,
} from '../lib/xml';

const ENTRIES_STORAGE_KEY = 'app.textReplacement.entries';
const HISTORY_STORAGE_KEY = 'app.textReplacement.history';
const HISTORY_LIMIT = 50;

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 11);
}

function cloneEntries(entries: TextReplacementEntry[]): TextReplacementEntry[] {
  return entries.map((entry) => ({ ...entry }));
}

function areEntryListsEqual(
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

export type SortBy = 'updatedAt' | 'shortcut' | 'phrase';
export type SortOrder = 'asc' | 'desc';

export type HistoryEventType = 'create' | 'update' | 'delete' | 'import' | 'undo';

export interface TextReplacementEntry {
  id: string;
  shortcut: string;
  phrase: string;
  createdAt: string;
  updatedAt: string;
  source: 'manual' | 'import';
}

export interface HistoryEntry {
  id: string;
  type: HistoryEventType;
  timestamp: string;
  summary: string;
  before: TextReplacementEntry[];
  after: TextReplacementEntry[];
}

export interface ImportPreviewItem {
  id: string;
  shortcut: string;
  phrase: string;
  status: 'new' | 'update';
  existingEntryId?: string;
  selected: boolean;
}

export interface ImportPreviewState {
  fileName: string;
  items: ImportPreviewItem[];
}

export interface UseTextReplacementEntriesResult {
  entries: TextReplacementEntry[];
  visibleEntries: TextReplacementEntry[];
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchTerm: string;
  historyEntries: HistoryEntry[];
  importPreview: ImportPreviewState | null;
  setSearchTerm: (value: string) => void;
  setSortBy: (sortBy: SortBy) => void;
  toggleSortOrder: () => void;
  saveEntry: (input: { id?: string; shortcut: string; phrase: string }) => void;
  deleteEntry: (id: string) => void;
  prepareImportPreview: (items: ParsedTextReplacementItem[], fileName: string) => void;
  toggleImportSelection: (id: string) => void;
  selectAllImportItems: (selected: boolean) => void;
  confirmImportSelection: () => void;
  cancelImportPreview: () => void;
  undoHistory: (historyEntryId: string) => void;
  exportEntriesAsXml: () => string;
}

function readEntriesFromStorage(): TextReplacementEntry[] {
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
      }));
  } catch (error) {
    console.warn('Failed to read text replacement entries', error);
    return [];
  }
}

function readHistoryFromStorage(): HistoryEntry[] {
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
        before: item.before.map((entry) => ({ ...entry })),
        after: item.after.map((entry) => ({ ...entry })),
      }));
  } catch (error) {
    console.warn('Failed to read text replacement history', error);
    return [];
  }
}

function persistEntries(entries: TextReplacementEntry[]): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('Failed to persist text replacement entries', error);
  }
}

function persistHistory(history: HistoryEntry[]): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to persist text replacement history', error);
  }
}

function createHistoryEntry(
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

function sortEntries(
  entries: TextReplacementEntry[],
  sortBy: SortBy,
  sortOrder: SortOrder
): TextReplacementEntry[] {
  const sorted = [...entries].sort((a, b) => {
    if (sortBy === 'updatedAt') {
      return a.updatedAt.localeCompare(b.updatedAt);
    }

    const first = a[sortBy] ?? '';
    const second = b[sortBy] ?? '';
    return first.localeCompare(second, undefined, { sensitivity: 'base' });
  });

  return sortOrder === 'desc' ? sorted.reverse() : sorted;
}

export function useTextReplacementEntries(): UseTextReplacementEntriesResult {
  const [entries, setEntries] = useState<TextReplacementEntry[]>(() => readEntriesFromStorage());
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(() => readHistoryFromStorage());
  const [sortBy, setSortByState] = useState<SortBy>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [importPreview, setImportPreview] = useState<ImportPreviewState | null>(null);

  const entriesRef = useRef(entries);
  const historyRef = useRef(historyEntries);

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

    return sortEntries(filtered, sortBy, sortOrder);
  }, [entries, searchTerm, sortBy, sortOrder]);

  const appendHistory = useCallback(
    (record: HistoryEntry | null) => {
      if (!record) return;
      setHistoryEntries((prev) => {
        const next = [record, ...prev];
        return next.slice(0, HISTORY_LIMIT);
      });
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

  const prepareImportPreview = useCallback(
    (items: ParsedTextReplacementItem[], fileName: string) => {
      if (!items.length) {
        setImportPreview({ fileName, items: [] });
        return;
      }

      const nextItems: ImportPreviewItem[] = [];
      const existingByShortcut = new Map(
        entriesRef.current.map((entry) => [entry.shortcut, entry])
      );

      items.forEach((item) => {
        const shortcut = item.shortcut.trim();
        const phrase = item.phrase.trim();
        if (!shortcut && !phrase) return;

        const existing = existingByShortcut.get(shortcut);
        if (!existing) {
          nextItems.push({
            id: `new:${generateId()}`,
            shortcut,
            phrase,
            status: 'new',
            selected: true,
          });
          return;
        }

        if (existing.phrase !== phrase) {
          nextItems.push({
            id: `update:${existing.id}`,
            shortcut,
            phrase,
            status: 'update',
            existingEntryId: existing.id,
            selected: true,
          });
        }
      });

      setImportPreview({
        fileName,
        items: nextItems,
      });
    },
    []
  );

  const toggleImportSelection = useCallback((id: string) => {
    setImportPreview((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, selected: !item.selected } : item
        ),
      };
    });
  }, []);

  const selectAllImportItems = useCallback((selected: boolean) => {
    setImportPreview((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) => ({ ...item, selected })),
      };
    });
  }, []);

  const confirmImportSelection = useCallback(() => {
    setImportPreview((prevPreview) => {
      if (!prevPreview) return prevPreview;
      const selectedItems = prevPreview.items.filter((item) => item.selected);
      if (selectedItems.length === 0) {
        return null;
      }

      const now = new Date().toISOString();

      setEntries((prevEntries) => {
        let nextEntries = [...prevEntries];
        let changed = false;

        selectedItems.forEach((item) => {
          if (item.status === 'new') {
            const newEntry: TextReplacementEntry = {
              id: generateId(),
              shortcut: item.shortcut,
              phrase: item.phrase,
              createdAt: now,
              updatedAt: now,
              source: 'import',
            };
            nextEntries = [newEntry, ...nextEntries];
            changed = true;
          } else if (item.status === 'update' && item.existingEntryId) {
            nextEntries = nextEntries.map((entry) =>
              entry.id === item.existingEntryId
                ? {
                    ...entry,
                    phrase: item.phrase,
                    updatedAt: now,
                    source: entry.source === 'manual' ? 'manual' : 'import',
                  }
                : entry
            );
            changed = true;
          }
        });

        if (!changed) {
          return prevEntries;
        }

        const before = cloneEntries(prevEntries);
        const history = createHistoryEntry(
          'import',
          `Imported ${selectedItems.length} entr${selectedItems.length === 1 ? 'y' : 'ies'} from ${prevPreview.fileName}`,
          before,
          nextEntries
        );
        appendHistory(history);
        return nextEntries;
      });

      return null;
    });
  }, [appendHistory]);

  const cancelImportPreview = useCallback(() => {
    setImportPreview(null);
  }, []);

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

  const exportEntriesAsXml = useCallback(() => {
    const items = sortEntries(entriesRef.current, 'shortcut', 'asc').map((entry) => ({
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
  };
}
