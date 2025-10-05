import { FormEvent, useMemo, useState } from 'react';
import StorageEntryList from './components/StorageEntryList';
import {
  useStorageEntries,
  type StorageEntry,
} from './hooks/useStorageEntries';

export default function StoragePage(): JSX.Element {
  const { entries, addEntry, updateEntry, removeEntry, clearEntries } =
    useStorageEntries();
  const [draftKey, setDraftKey] = useState('');
  const [draftValue, setDraftValue] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ key: '', value: '' });

  const isEditing = editingId !== null;

  const entryCountLabel = useMemo(() => {
    if (entries.length === 0) return 'No entries stored';
    if (entries.length === 1) return '1 entry stored';
    return `${entries.length} entries stored`;
  }, [entries.length]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draftKey.trim() && !draftValue.trim()) return;

    addEntry({ key: draftKey, value: draftValue });
    setDraftKey('');
    setDraftValue('');
  };

  const handleEditStart = (entry: StorageEntry) => {
    setEditingId(entry.id);
    setEditDraft({ key: entry.key, value: entry.value });
  };

  const handleEditConfirm = () => {
    if (!editingId) return;
    updateEntry(editingId, editDraft);
    setEditingId(null);
    setEditDraft({ key: '', value: '' });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditDraft({ key: '', value: '' });
  };

  return (
    <section className="w-full max-w-4xl space-y-8 px-4">
      <header className="space-y-2 text-center sm:text-left">
        <h2 className="text-3xl font-semibold tracking-wide text-slate-100 sm:text-4xl">
          Browser Storage Explorer
        </h2>
        <p className="text-base text-slate-300 sm:text-lg">
          Persist and refine local key/value pairs using localStorage. Changes will
          stick across refreshes on this device.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-700/70 bg-slate-900/70 p-6 shadow-[0_30px_50px_rgba(15,23,42,0.35)]"
      >
        <h3 className="text-xl font-semibold text-slate-100">Add new entry</h3>
        <p className="mt-1 text-sm text-slate-400">
          Keys are unique. Adding an existing key updates the stored value.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Key
            <input
              className="rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-2 text-base text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              value={draftKey}
              onChange={(event) => setDraftKey(event.target.value)}
              placeholder="analytics-enabled"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Value
            <textarea
              className="min-h-[80px] rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-2 text-base text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              placeholder="true"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
            disabled={!draftKey.trim() && !draftValue.trim()}
          >
            Save to storage
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            onClick={() => {
              setDraftKey('');
              setDraftValue('');
            }}
            disabled={!draftKey && !draftValue}
          >
            Clear form
          </button>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
            {entryCountLabel}
          </span>
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-slate-100">Stored entries</h3>
          <button
            type="button"
            className="rounded-full bg-rose-500/80 px-4 py-2 text-sm font-semibold text-rose-50 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300 disabled:opacity-40 disabled:hover:translate-y-0"
            onClick={clearEntries}
            disabled={entries.length === 0 || isEditing}
          >
            Clear all
          </button>
        </div>
        <StorageEntryList
          entries={entries}
          editingId={editingId}
          editDraft={editDraft}
          onEditDraftChange={(field, value) =>
            setEditDraft((prev) => ({ ...prev, [field]: value }))
          }
          onEditStart={handleEditStart}
          onEditCancel={handleEditCancel}
          onEditConfirm={handleEditConfirm}
          onDelete={(id) => {
            removeEntry(id);
            if (editingId === id) {
              handleEditCancel();
            }
          }}
        />
      </div>
    </section>
  );
}
