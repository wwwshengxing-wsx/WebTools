import type { TextReplacementEntry } from '../hooks/useTextReplacementEntries';

interface TextReplacementTableProps {
  entries: TextReplacementEntry[];
  onEdit: (entry: TextReplacementEntry) => void;
  onDelete: (entryId: string) => void;
}

function formatDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export default function TextReplacementTable(
  props: TextReplacementTableProps
): JSX.Element {
  const { entries, onEdit, onDelete } = props;

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
            <th scope="col" className="px-6 py-4 font-semibold">
              Shortcut
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Phrase
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
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-slate-800/40">
              <td className="px-6 py-4 text-sm font-semibold text-slate-100">
                {entry.shortcut || <span className="text-slate-500">(empty)</span>}
              </td>
              <td className="px-6 py-4 text-sm text-slate-200">
                <span className="block max-w-xl truncate" title={entry.phrase}>
                  {entry.phrase || <span className="text-slate-500">(empty)</span>}
                </span>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
