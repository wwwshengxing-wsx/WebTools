import { useEffect, useMemo, useRef } from 'react';
import type { TextReplacementEntry } from '../hooks/useTextReplacementEntries';

interface TextReplacementTableProps {
  entries: TextReplacementEntry[];
  selectionMode: boolean;
  selectedEntryIds: string[];
  onEdit: (entry: TextReplacementEntry) => void;
  onDelete: (entryId: string) => void;
  onToggleEntrySelection: (entryId: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
}

function formatDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export default function TextReplacementTable(props: TextReplacementTableProps): JSX.Element {
  const {
    entries,
    selectionMode,
    selectedEntryIds,
    onEdit,
    onDelete,
    onToggleEntrySelection,
    onToggleSelectAll,
  } = props;

  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  const selectionStats = useMemo(() => {
    const count = selectedEntryIds.length;
    const allVisibleSelected = entries.length > 0 && entries.every((entry) => selectedEntryIds.includes(entry.id));
    const anySelected = count > 0;
    return { count, allVisibleSelected, anySelected };
  }, [entries, selectedEntryIds]);

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    headerCheckboxRef.current.indeterminate = selectionStats.anySelected && !selectionStats.allVisibleSelected;
  }, [selectionStats]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700/70 bg-slate-900/40 px-8 py-14 text-center">
        <p className="text-lg font-semibold text-slate-200">No entries yet</p>
        <p className="mt-2 max-w-lg text-sm text-slate-400">
          Import an XML file or add a new entry to begin managing your text replacements.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/70 shadow-[0_25px_40px_rgba(15,23,42,0.35)]">
      <table className="min-w-full divide-y divide-slate-700/80 text-left text-sm text-slate-200">
        <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            {selectionMode ? (
              <th scope="col" className="w-12 p-4">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={selectionStats.allVisibleSelected}
                  onChange={(event) => onToggleSelectAll(event.target.checked)}
                  className="size-4 rounded border border-slate-500 bg-slate-800 accent-sky-400"
                />
              </th>
            ) : null}
            <th scope="col" className="px-6 py-4 font-semibold">
              Shortcut
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Phrase
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Tags
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Updated
            </th>
            <th scope="col" className="px-6 py-4 text-right font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {entries.map((entry) => {
            const isSelected = selectedEntryIds.includes(entry.id);
            return (
              <tr key={entry.id} className={selectionMode && isSelected ? 'bg-slate-800/40' : 'hover:bg-slate-800/40'}>
                {selectionMode ? (
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleEntrySelection(entry.id)}
                      className="size-4 rounded border border-slate-500 bg-slate-800 accent-sky-400"
                    />
                  </td>
                ) : null}
                <td className="px-6 py-4 text-sm font-semibold text-slate-100">
                  {entry.shortcut || <span className="text-slate-500">(empty)</span>}
                </td>
                <td className="px-6 py-4 text-sm text-slate-200">
                  <span className="block max-w-xl truncate" title={entry.phrase}>
                    {entry.phrase || <span className="text-slate-500">(empty)</span>}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-300">
                  {entry.tags.length === 0 ? (
                    <span className="text-slate-500">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-violet-500/20 px-3 py-0.5 text-xs font-semibold text-violet-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">
                  {formatDate(entry.updatedAt)}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(entry)}
                      className="rounded-full bg-sky-500/80 px-4 py-1 text-xs font-semibold text-slate-900 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(entry.id)}
                      className="rounded-full bg-rose-500/80 px-4 py-1 text-xs font-semibold text-rose-100 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
