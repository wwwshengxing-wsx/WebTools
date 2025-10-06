import { useEffect, useMemo, useState } from 'react';
import type { SortBy, SortOrder } from '../hooks/useTextReplacementEntries';

interface TextReplacementToolbarProps {
  searchTerm: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  availableTags: string[];
  selectedTags: string[];
  selectionMode: boolean;
  selectedCount: number;
  onSearchTermChange: (value: string) => void;
  onSortByChange: (value: SortBy) => void;
  onSortOrderToggle: () => void;
  onAddClick: () => void;
  onCompareClick: () => void;
  onImportClick: () => void;
  onExportClick: () => void;
  onTagToggle: (tag: string) => void;
  onClearTagFilters: () => void;
  onClearAll: () => void;
  onToggleSelectionMode: (enabled?: boolean) => void;
  onSelectAllVisible: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onAddTagToSelection: (tag: string) => void;
}

const sortByLabels: Record<SortBy, string> = {
  updatedAt: 'Last updated',
  shortcut: 'Shortcut',
  phrase: 'Phrase',
};

export default function TextReplacementToolbar(
  props: TextReplacementToolbarProps
): JSX.Element {
  const {
    searchTerm,
    sortBy,
    sortOrder,
  availableTags,
  selectedTags,
  selectionMode,
  selectedCount,
  onSearchTermChange,
  onSortByChange,
  onSortOrderToggle,
  onAddClick,
  onCompareClick,
  onImportClick,
  onExportClick,
  onTagToggle,
  onClearTagFilters,
  onClearAll,
  onToggleSelectionMode,
  onSelectAllVisible,
  onClearSelection,
  onDeleteSelected,
  onAddTagToSelection,
  } = props;

  const hasTagFilters = selectedTags.length > 0;
  const hasSelection = selectedCount > 0;
  const [isTagFormOpen, setIsTagFormOpen] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const normalizedDraft = tagDraft.trim();

  useEffect(() => {
    if (!selectionMode) {
      setIsTagFormOpen(false);
      setTagDraft('');
    }
  }, [selectionMode]);

  const tagSuggestions = useMemo(() => {
    if (!availableTags.length) return [] as string[];
    const lowerDraft = normalizedDraft.toLowerCase();
    return availableTags
      .filter((tag) => !lowerDraft || tag.toLowerCase().includes(lowerDraft))
      .slice(0, 8);
  }, [availableTags, normalizedDraft]);

  const handleSubmitTag = () => {
    if (!normalizedDraft) return;
    onAddTagToSelection(normalizedDraft);
    setTagDraft('');
    setIsTagFormOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-slate-700/70 bg-slate-900/70 p-6 shadow-[0_30px_50px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-2 text-sm font-medium text-slate-200">
            Search entries
            <input
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="Search shortcut, phrase, or tag"
              className="h-11 rounded-xl border border-slate-600 bg-slate-800/80 px-3 text-base text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </label>
          <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-200 sm:w-52">
            Sort by
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(event) => onSortByChange(event.target.value as SortBy)}
                className="h-11 flex-1 rounded-xl border border-slate-600 bg-slate-800/80 px-3 text-base text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              >
                {Object.entries(sortByLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onSortOrderToggle}
                className="inline-flex h-11 items-center rounded-xl border border-slate-600 bg-slate-800/80 px-4 text-sm font-semibold text-slate-100 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
              >
                {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </button>
            </div>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
          >
            New entry
          </button>
          <button
            type="button"
            onClick={onCompareClick}
            className="inline-flex items-center justify-center rounded-full bg-violet-400 px-5 py-2 text-sm font-semibold text-violet-950 shadow-sm transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200"
          >
            Compare
          </button>
          <button
            type="button"
            onClick={onImportClick}
            className="inline-flex items-center justify-center rounded-full bg-emerald-500/90 px-5 py-2 text-sm font-semibold text-emerald-950 shadow-sm transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
          >
            Import
          </button>
          <button
            type="button"
            onClick={onExportClick}
            className="inline-flex items-center justify-center rounded-full bg-slate-100/90 px-5 py-2 text-sm font-semibold text-slate-900 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
          >
            Export
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center justify-center rounded-full bg-rose-500/90 px-5 py-2 text-sm font-semibold text-rose-50 shadow-sm transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => onToggleSelectionMode()}
            className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${
              selectionMode ? 'bg-slate-200 text-slate-900' : 'bg-slate-700 text-slate-200'
            }`}
          >
            {selectionMode ? 'Exit selection' : 'Select multiple'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-slate-200">
        <div className="flex items-center justify-between">
          <span className="font-medium">Filter by tags</span>
          <button
            type="button"
            onClick={onClearTagFilters}
            disabled={!hasTagFilters}
            className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            Clear tag filters
          </button>
        </div>
        {availableTags.length === 0 ? (
          <p className="text-xs text-slate-500">No tags yet. Add tags when creating or editing entries.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagToggle(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    isActive
                      ? 'bg-violet-500 text-slate-900 focus-visible:outline-violet-200'
                      : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700 focus-visible:outline-slate-400'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectionMode ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-700/70 bg-slate-900/80 px-4 py-3 text-sm text-slate-200">
          <span className="font-semibold">{selectedCount} selected</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSelectAllVisible}
              className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              Select visible
            </button>
            <button
              type="button"
              onClick={onClearSelection}
              disabled={!hasSelection}
              className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:opacity-40 disabled:hover:translate-y-0"
            >
              Clear selection
            </button>
            <button
              type="button"
              onClick={() => {
                if (!hasSelection) return;
                setIsTagFormOpen((prev) => !prev);
              }}
              disabled={!hasSelection}
              className="rounded-full bg-violet-500/80 px-3 py-1 text-xs font-semibold text-violet-50 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 disabled:opacity-40 disabled:hover:translate-y-0"
            >
              {isTagFormOpen ? 'Close tag picker' : 'Add tag'}
            </button>
            <button
              type="button"
              onClick={onDeleteSelected}
              disabled={!hasSelection}
              className="rounded-full bg-rose-500/80 px-3 py-1 text-xs font-semibold text-rose-50 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200 disabled:opacity-40 disabled:hover:translate-y-0"
            >
              Delete selected
            </button>
          </div>
          {isTagFormOpen ? (
            <div className="flex w-full flex-col gap-2 rounded-2xl border border-violet-500/40 bg-violet-500/10 px-4 py-3 text-xs text-slate-200 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <input
                  value={tagDraft}
                  onChange={(event) => setTagDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSubmitTag();
                    }
                  }}
                  placeholder="Enter a tag (press Enter to apply)"
                  className="h-9 flex-1 rounded-lg border border-violet-500/70 bg-slate-900/70 px-3 text-sm text-slate-100 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-300/40"
                />
                <button
                  type="button"
                  onClick={handleSubmitTag}
                  disabled={!normalizedDraft}
                  className="inline-flex items-center justify-center rounded-full bg-violet-500 px-4 py-1.5 text-xs font-semibold text-slate-900 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  Apply tag
                </button>
              </div>
              {tagSuggestions.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2 sm:pt-0">
                  {tagSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setTagDraft(tag);
                        onAddTagToSelection(tag);
                        setIsTagFormOpen(false);
                      }}
                      className="rounded-full bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-200 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
