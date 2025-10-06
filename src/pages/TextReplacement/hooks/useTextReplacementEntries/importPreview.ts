import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { ParsedTextReplacementItem } from '../../lib/xml';
import {
  type HistoryEntry,
  type ImportPreviewItem,
  type ImportPreviewState,
  type TextReplacementEntry,
} from './types';
import { areTagsEqual, cloneEntries, generateId, normalizeTags } from './utils';
import { createHistoryEntry } from './history';

export interface ImportPreviewDependencies {
  entriesRef: MutableRefObject<TextReplacementEntry[]>;
  setEntries: Dispatch<SetStateAction<TextReplacementEntry[]>>;
  setImportPreview: Dispatch<SetStateAction<ImportPreviewState | null>>;
  appendHistory: (entry: HistoryEntry | null) => void;
}

export function createImportPreviewActions({
  entriesRef,
  setEntries,
  setImportPreview,
  appendHistory,
}: ImportPreviewDependencies) {
  const prepareImportPreview = (items: ParsedTextReplacementItem[], fileName: string) => {
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
      const tags = normalizeTags(item.tags ?? []);

      const existing = existingByShortcut.get(shortcut);
      if (!existing) {
        nextItems.push({
          id: `new:${generateId()}`,
          shortcut,
          phrase,
          tags,
          status: 'new',
          selected: true,
        });
        return;
      }

      if (existing.phrase !== phrase || !areTagsEqual(existing.tags, tags)) {
        nextItems.push({
          id: `update:${existing.id}`,
          shortcut,
          phrase,
          tags,
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
  };

  const toggleImportSelection = (id: string) => {
    setImportPreview((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, selected: !item.selected } : item
        ),
      };
    });
  };

  const selectAllImportItems = (selected: boolean) => {
    setImportPreview((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) => ({ ...item, selected })),
      };
    });
  };

  const confirmImportSelection = () => {
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
          const normalizedTags = normalizeTags(item.tags ?? []);
          if (item.status === 'new') {
            const newEntry: TextReplacementEntry = {
              id: generateId(),
              shortcut: item.shortcut,
              phrase: item.phrase,
              tags: normalizedTags,
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
                    tags: normalizedTags,
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
  };

  const cancelImportPreview = () => {
    setImportPreview(null);
  };

  return {
    prepareImportPreview,
    toggleImportSelection,
    selectAllImportItems,
    confirmImportSelection,
    cancelImportPreview,
  };
}
