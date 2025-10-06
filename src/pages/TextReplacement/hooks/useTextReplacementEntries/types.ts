import type { ParsedTextReplacementItem } from '../../lib/xml';

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

export type ComparisonStatus = 'identical' | 'fileOnly' | 'currentOnly' | 'modified';

export interface ComparisonItem {
  id: string;
  shortcut: string;
  status: ComparisonStatus;
  currentEntry: TextReplacementEntry | null;
  fileEntry: {
    shortcut: string;
    phrase: string;
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
  historyEntries: HistoryEntry[];
  importPreview: ImportPreviewState | null;
  comparisonPreview: ComparisonPreviewState | null;
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
  prepareComparisonPreview: (items: ParsedTextReplacementItem[], fileName: string) => void;
  closeComparisonPreview: () => void;
  addComparisonEntry: (shortcut: string) => void;
  applyComparisonEntry: (shortcut: string) => void;
  removeComparisonEntry: (shortcut: string) => void;
}
