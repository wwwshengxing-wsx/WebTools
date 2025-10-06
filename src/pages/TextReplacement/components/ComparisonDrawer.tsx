import type {
  ComparisonItem,
  ComparisonPreviewState,
  ComparisonStatus,
} from '../hooks/useTextReplacementEntries';
import { useMemo, useState } from 'react';

interface ComparisonDrawerProps {
  comparison: ComparisonPreviewState | null;
  onClose: () => void;
  onAdd: (shortcut: string) => void;
  onApply: (shortcut: string) => void;
  onRemove: (shortcut: string) => void;
}

type StatusFilter = 'all' | ComparisonStatus;

const statusStyles: Record<ComparisonStatus, { label: string; className: string }> = {
  modified: {
    label: 'Changed',
    className: 'bg-amber-500/20 text-amber-300',
  },
  fileOnly: {
    label: 'Only in file',
    className: 'bg-emerald-500/20 text-emerald-300',
  },
  currentOnly: {
    label: 'Only current',
    className: 'bg-rose-500/20 text-rose-300',
  },
  identical: {
    label: 'Identical',
    className: 'bg-slate-500/20 text-slate-300',
  },
};

function renderPhrase(value: string | undefined): string {
  if (!value) return '(empty phrase)';
  return value;
}

function ComparisonRowActions(props: {
  item: ComparisonItem;
  onAdd: (shortcut: string) => void;
  onApply: (shortcut: string) => void;
  onRemove: (shortcut: string) => void;
}): JSX.Element | null {
  const { item, onAdd, onApply, onRemove } = props;

  const actions: JSX.Element[] = [];

  if (item.status === 'fileOnly') {
    actions.push(
      <button
        key="add"
        type="button"
        onClick={() => onAdd(item.fileEntry?.shortcut ?? item.shortcut)}
        className="rounded-full bg-emerald-500/90 px-4 py-1.5 text-xs font-semibold text-emerald-950 shadow-sm transition-transform duration-150 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
      >
        Add from file
      </button>
    );
  }

  if (item.status === 'modified') {
    actions.push(
      <button
        key="apply"
        type="button"
        onClick={() => onApply(item.fileEntry?.shortcut ?? item.shortcut)}
        className="rounded-full bg-sky-400 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-sm transition-transform duration-150 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
      >
        Use file phrase
      </button>
    );
  }

  if (item.status === 'currentOnly' || item.status === 'modified') {
    actions.push(
      <button
        key="remove"
        type="button"
        onClick={() => onRemove(item.currentEntry?.shortcut ?? item.shortcut)}
        className="rounded-full bg-rose-500/90 px-4 py-1.5 text-xs font-semibold text-rose-50 shadow-sm transition-transform duration-150 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200"
      >
        Remove current
      </button>
    );
  }

  if (actions.length === 0) return null;

  return <div className="flex flex-wrap gap-2">{actions}</div>;
}

export default function ComparisonDrawer(props: ComparisonDrawerProps): JSX.Element | null {
  const { comparison, onClose, onAdd, onApply, onRemove } = props;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tagFilter, setTagFilter] = useState('');

  const items = useMemo(() => comparison?.items ?? [], [comparison]);
  const fileName = comparison?.fileName ?? '';
  const differenceCount = comparison?.differenceCount ?? 0;

  const uniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((item) => {
      (item.fileEntry?.tags ?? []).forEach((tag) => tagSet.add(tag));
      (item.currentEntry?.tags ?? []).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [items]);

  const filteredItems = useMemo(() => {
    const lowerTag = tagFilter.trim().toLowerCase();
    return items.filter((item) => {
      if (item.status === 'identical') return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!lowerTag) return true;
      const fileTags = item.fileEntry?.tags ?? [];
      const currentTags = item.currentEntry?.tags ?? [];
      return (
        fileTags.some((tag) => tag.toLowerCase().includes(lowerTag)) ||
        currentTags.some((tag) => tag.toLowerCase().includes(lowerTag))
      );
    });
  }, [items, statusFilter, tagFilter]);

  if (!comparison) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/70">
      <aside className="flex size-full max-w-5xl flex-col gap-6 border-l border-slate-700/70 bg-slate-900/95 px-6 py-8 shadow-2xl">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-slate-100">Compare with {fileName}</h3>
            <p className="mt-1 text-sm text-slate-400">
              {differenceCount === 0
                ? 'No differences detected between the file and local entries.'
                : `${differenceCount} difference${differenceCount === 1 ? '' : 's'} found.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="self-end rounded-full bg-slate-800/80 px-3 py-1 text-sm font-semibold text-slate-300 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
          >
            Close
          </button>
        </header>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-700/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="h-9 rounded-lg border border-slate-600 bg-slate-800/80 px-3 text-sm text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              >
                <option value="all">All differences</option>
                <option value="modified">Changed</option>
                <option value="fileOnly">Only in file</option>
                <option value="currentOnly">Only current</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Filter tags
              <input
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
                placeholder="Search tags"
                className="h-9 rounded-lg border border-slate-600 bg-slate-800/80 px-3 text-sm text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              />
            </label>
            {uniqueTags.length > 0 ? (
              <div className="flex flex-wrap gap-2 text-xs text-slate-200">
                {uniqueTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTagFilter(tag)}
                    className="rounded-full bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-200 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/70 bg-slate-950/50 p-6 text-sm text-slate-300">
            The selected file did not contain any entries.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/70 bg-slate-950/50 p-6 text-sm text-slate-300">
            No differences detected between the file and local entries.
          </div>
        ) : (
          <ul className="flex-1 space-y-4 overflow-y-auto pr-2">
            {filteredItems.map((item) => {
                const status = statusStyles[item.status];
                const filePhrase = item.fileEntry ? renderPhrase(item.fileEntry.phrase) : 'Not present in file';
                const currentPhrase = item.currentEntry
                  ? renderPhrase(item.currentEntry.phrase)
                  : 'Not present locally';
                const fileTags = item.fileEntry?.tags ?? [];
                const currentTags = item.currentEntry?.tags ?? [];

                return (
                  <li
                    key={item.id}
                    className="rounded-2xl border border-slate-700/70 bg-slate-950/50 p-4 text-sm text-slate-200"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-100">
                        {item.shortcut || '(empty shortcut)'}
                      </p>
                      <span
                        className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <ComparisonRowActions item={item} onAdd={onAdd} onApply={onApply} onRemove={onRemove} />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">File</p>
                      <p className="mt-2 text-sm text-slate-200">{filePhrase}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {fileTags.length === 0 ? (
                          <span className="text-slate-500">No tags</span>
                        ) : (
                          fileTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-semibold text-violet-200"
                            >
                              {tag}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current</p>
                      <p className="mt-2 text-sm text-slate-200">{currentPhrase}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {currentTags.length === 0 ? (
                          <span className="text-slate-500">No tags</span>
                        ) : (
                          currentTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full bg-slate-500/30 px-2 py-0.5 text-xs font-semibold text-slate-100"
                            >
                              {tag}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
              })}
          </ul>
        )}
      </aside>
    </div>
  );
}
