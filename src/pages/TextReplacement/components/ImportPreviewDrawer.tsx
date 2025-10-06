import type { ImportPreviewState } from '../hooks/useTextReplacementEntries';

interface ImportPreviewDrawerProps {
  preview: ImportPreviewState | null;
  onClose: () => void;
  onToggleItem: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onConfirm: () => void;
}

export default function ImportPreviewDrawer(
  props: ImportPreviewDrawerProps
): JSX.Element | null {
  const { preview, onClose, onToggleItem, onSelectAll, onConfirm } = props;

  if (!preview) return null;

  const selectedCount = preview.items.filter((item) => item.selected).length;
  const allSelected = preview.items.length > 0 && selectedCount === preview.items.length;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/70">
      <aside className="flex h-full w-full max-w-xl flex-col gap-6 border-l border-slate-700/70 bg-slate-900/95 px-6 py-8 shadow-2xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-100">Import preview</h3>
            <p className="mt-1 text-sm text-slate-400">
              {preview.items.length === 0
                ? 'No new or updated shortcuts detected.'
                : `Review ${preview.items.length} entr${preview.items.length === 1 ? 'y' : 'ies'} found in ${preview.fileName}.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-800/80 px-3 py-1 text-sm font-semibold text-slate-300 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
          >
            ×
          </button>
        </header>

        {preview.items.length > 0 ? (
          <>
            <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onSelectAll(event.target.checked)}
                  className="h-4 w-4 rounded border border-slate-500 bg-slate-800 accent-sky-400"
                />
                Select all
              </label>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {selectedCount} selected
              </span>
            </div>

            <ul className="flex-1 space-y-3 overflow-y-auto pr-2">
              {preview.items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl border border-slate-700/70 bg-slate-950/50 p-4"
                >
                  <label className="flex items-start gap-3 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => onToggleItem(item.id)}
                      className="mt-1 h-4 w-4 rounded border border-slate-500 bg-slate-800 accent-sky-400"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-sky-300">
                          {item.status === 'new' ? 'New' : 'Update'}
                        </span>
                        <span className="text-xs text-slate-400">{item.shortcut || '(empty shortcut)'}</span>
                      </div>
                      <p className="text-sm text-slate-200">
                        {item.phrase || <span className="text-slate-500">(empty phrase)</span>}
                      </p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={preview.items.length === 0 || selectedCount === 0}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 shadow-sm transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            Confirm import
          </button>
        </div>
      </aside>
    </div>
  );
}
