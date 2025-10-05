import type { StorageEntry } from '../hooks/useStorageEntries';

export interface StorageEntryListProps {
  entries: StorageEntry[];
  editingId: string | null;
  editDraft: { key: string; value: string };
  onEditDraftChange: (field: 'key' | 'value', value: string) => void;
  onEditStart: (entry: StorageEntry) => void;
  onEditCancel: () => void;
  onEditConfirm: () => void;
  onDelete: (id: string) => void;
}

export default function StorageEntryList({
  entries,
  editingId,
  editDraft,
  onEditDraftChange,
  onEditStart,
  onEditCancel,
  onEditConfirm,
  onDelete,
}: StorageEntryListProps): JSX.Element {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/40 p-6 text-center text-sm text-slate-300">
        No entries yet. Add a key/value pair to see it appear here.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {entries.map((entry) => {
        const isEditing = editingId === entry.id;

        return (
          <li
            key={entry.id}
            className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 shadow-[0_20px_30px_rgba(15,23,42,0.35)]"
          >
            {isEditing ? (
              <form
                className="flex flex-col gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  onEditConfirm();
                }}
              >
                <label className="flex flex-col gap-1 text-left text-sm font-medium text-slate-200">
                  Key
                  <input
                    className="rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-2 text-base text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                    value={editDraft.key}
                    onChange={(event) => onEditDraftChange('key', event.target.value)}
                    placeholder="feature-flag"
                  />
                </label>
                <label className="flex flex-col gap-1 text-left text-sm font-medium text-slate-200">
                  Value
                  <textarea
                    className="min-h-[96px] rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-2 text-base text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                    value={editDraft.value}
                    onChange={(event) => onEditDraftChange('value', event.target.value)}
                    placeholder="Enabled"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors duration-150 hover:bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
                  >
                    Save changes
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition-colors duration-150 hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                    onClick={onEditCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-widest text-slate-400">{entry.key || 'Untitled key'}</p>
                  <p className="mt-1 whitespace-pre-wrap text-lg text-slate-100">{entry.value || '—'}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                    Updated {new Date(entry.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
                    onClick={() => onEditStart(entry)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-rose-500/80 px-4 py-2 text-sm font-semibold text-rose-50 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
                    onClick={() => onDelete(entry.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
