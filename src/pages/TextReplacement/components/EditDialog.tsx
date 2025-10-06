import { FormEvent, useEffect, useState } from 'react';

interface EditDialogProps {
  isOpen: boolean;
  title: string;
  initialShortcut: string;
  initialPhrase: string;
  onSave: (values: { shortcut: string; phrase: string }) => void;
  onDismiss: () => void;
}

export default function EditDialog(props: EditDialogProps): JSX.Element | null {
  const { isOpen, title, initialShortcut, initialPhrase, onSave, onDismiss } = props;
  const [shortcut, setShortcut] = useState(initialShortcut);
  const [phrase, setPhrase] = useState(initialPhrase);

  useEffect(() => {
    if (isOpen) {
      setShortcut(initialShortcut);
      setPhrase(initialPhrase);
    }
  }, [isOpen, initialShortcut, initialPhrase]);

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({ shortcut, phrase });
  };

  const isDisabled = !shortcut.trim() && !phrase.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-700/60 bg-slate-900/90 p-6 shadow-2xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-100">{title}</h3>
            <p className="mt-1 text-sm text-slate-400">
              Both fields support plain text. Shortcut is treated as the unique key.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onDismiss}
            className="rounded-full bg-slate-800/80 px-3 py-1 text-sm font-semibold text-slate-300 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
          >
            ×
          </button>
        </header>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Shortcut
            <input
              value={shortcut}
              onChange={(event) => setShortcut(event.target.value)}
              className="h-11 rounded-xl border border-slate-600 bg-slate-800/80 px-3 text-base text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Phrase
            <textarea
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
              className="min-h-[120px] rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2 text-base text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </label>
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDisabled}
              className="rounded-full bg-sky-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-transform duration-150 hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200 disabled:opacity-40 disabled:hover:translate-y-0"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
