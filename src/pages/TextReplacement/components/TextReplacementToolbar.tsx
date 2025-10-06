import type { SortBy, SortOrder } from '../hooks/useTextReplacementEntries';

interface TextReplacementToolbarProps {
  searchTerm: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSearchTermChange: (value: string) => void;
  onSortByChange: (value: SortBy) => void;
  onSortOrderToggle: () => void;
  onAddClick: () => void;
  onCompareClick: () => void;
  onImportClick: () => void;
  onExportClick: () => void;
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
    onSearchTermChange,
    onSortByChange,
    onSortOrderToggle,
    onAddClick,
    onCompareClick,
    onImportClick,
    onExportClick,
  } = props;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-700/70 bg-slate-900/70 p-6 shadow-[0_30px_50px_rgba(15,23,42,0.35)] sm:flex-row sm:items-end sm:justify-between">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-2 text-sm font-medium text-slate-200">
          Search entries
          <input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search shortcut or phrase"
            className="h-11 rounded-xl border border-slate-600 bg-slate-800/80 px-3 text-base text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
          />
        </label>
        <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-200 sm:w-auto">
          Sort by
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(event) => onSortByChange(event.target.value as SortBy)}
              className="h-11 rounded-xl border border-slate-600 bg-slate-800/80 px-3 text-base text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
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
      </div>
    </div>
  );
}
