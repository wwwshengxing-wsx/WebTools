import type { ParsedTextReplacementItem } from '../../lib/xml';

export const NO_TAG_FILTER = '__NO_TAG__';

export type SortBy = 'updatedAt' | 'shortcut' | 'phrase';
export type SortOrder = 'asc' | 'desc';

export type HistoryEventType = 'create' | 'update' | 'delete' | 'import' | 'undo';

export interface TextReplacementEntry {
  id: string;
  shortcut: string;
  phrase: string;
  tags: string[];
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
  tags: string[];
  status: 'new' | 'update';
  existingEntryId?: string;
  selected: boolean;
}

export interface ImportPreviewState {
  fileName: string;
  items: ImportPreviewItem[];
}

export type ComparisonStatus = 'identical' | 'fileOnly' | 'currentOnly' | 'modified';

export interface ComparisonItem {
  id: string;
  shortcut: string;
  status: ComparisonStatus;
  currentEntry: TextReplacementEntry | null;
  fileEntry: {
    shortcut: string;
    phrase: string;
    tags: string[];
  } | null;
}

export interface ComparisonPreviewState {
  fileName: string;
  items: ComparisonItem[];
  differenceCount: number;
}

export interface UseTextReplacementEntriesResult {
  entries: TextReplacementEntry[];
  visibleEntries: TextReplacementEntry[];
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchTerm: string;
  availableTags: string[];
  selectedTags: string[];
  selectionMode: boolean;
  selectedEntryIds: string[];
  historyEntries: HistoryEntry[];
  importPreview: ImportPreviewState | null;
  comparisonPreview: ComparisonPreviewState | null;
  setSearchTerm: (value: string) => void;
  setSortBy: (sortBy: SortBy) => void;
  toggleSortOrder: () => void;
  setSelectedTags: (tags: string[]) => void;
  toggleTagFilter: (tag: string) => void;
  clearTagFilters: () => void;
  toggleSelectionMode: (enabled?: boolean) => void;
  toggleEntrySelection: (entryId: string) => void;
  selectAllVisibleEntries: () => void;
  clearSelection: () => void;
  saveEntry: (input: { id?: string; shortcut: string; phrase: string; tags: string[] }) => void;
  deleteEntry: (id: string) => void;
  deleteSelectedEntries: () => void;
  addTagToSelectedEntries: (tag: string) => void;
  prepareImportPreview: (items: ParsedTextReplacementItem[], fileName: string) => void;
  toggleImportSelection: (id: string) => void;
  selectAllImportItems: (selected: boolean) => void;
  confirmImportSelection: () => void;
  cancelImportPreview: () => void;
  undoHistory: (historyEntryId: string) => void;
  exportEntriesAsXml: () => string;
  clearAllEntries: () => void;
  prepareComparisonPreview: (items: ParsedTextReplacementItem[], fileName: string) => void;
  closeComparisonPreview: () => void;
  addComparisonEntry: (shortcut: string) => void;
  applyComparisonEntry: (shortcut: string) => void;
  removeComparisonEntry: (shortcut: string) => void;
}
