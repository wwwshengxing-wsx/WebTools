import type { HistoryEntry } from '../hooks/useTextReplacementEntries';

interface HistoryPanelProps {
  historyEntries: HistoryEntry[];
  onUndo: (historyEntryId: string) => void;
}

function formatTimestamp(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function HistoryPanel(props: HistoryPanelProps): JSX.Element {
  const { historyEntries, onUndo } = props;

  return (
    <aside className="flex w-full flex-col gap-4 rounded-3xl border border-slate-700/70 bg-slate-900/70 p-5 shadow-[0_25px_40px_rgba(15,23,42,0.35)] sm:max-w-sm">
      <header>
        <h3 className="text-lg font-semibold text-slate-100">History</h3>
        <p className="mt-1 text-xs text-slate-400">
          Tracks create, update, delete, import and undo actions in reverse chronological order.
        </p>
      </header>
      <ul className="flex-1 space-y-3 overflow-y-auto pr-1">
        {historyEntries.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/40 px-4 py-6 text-center text-sm text-slate-400">
            No history yet.
          </li>
        ) : (
          historyEntries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-2xl border border-slate-700/70 bg-slate-950/40 px-4 py-4 text-sm text-slate-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-100">{entry.summary}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {entry.type}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{formatTimestamp(entry.timestamp)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUndo(entry.id)}
                  className="rounded-full bg-slate-100/80 px-3 py-1 text-xs font-semibold text-slate-900 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
                >
                  Undo
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
