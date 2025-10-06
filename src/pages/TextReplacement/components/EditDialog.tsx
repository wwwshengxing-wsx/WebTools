import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';

interface EditDialogProps {
  isOpen: boolean;
  title: string;
  initialShortcut: string;
  initialPhrase: string;
  initialTags: string[];
  availableTags: string[];
  onSave: (values: { shortcut: string; phrase: string; tags: string[] }) => void;
  onDismiss: () => void;
}

export default function EditDialog(props: EditDialogProps): JSX.Element | null {
  const {
    isOpen,
    title,
    initialShortcut,
    initialPhrase,
    initialTags,
    availableTags,
    onSave,
    onDismiss,
  } = props;

  const [shortcut, setShortcut] = useState(initialShortcut);
  const [phrase, setPhrase] = useState(initialPhrase);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagDraft, setTagDraft] = useState('');

  useEffect(() => {
    if (isOpen) {
      setShortcut(initialShortcut);
      setPhrase(initialPhrase);
      setTags(initialTags);
      setTagDraft('');
    }
  }, [isOpen, initialShortcut, initialPhrase, initialTags]);

  const normalizedAvailableTags = useMemo(
    () => availableTags.filter((tag) => !tags.includes(tag)),
    [availableTags, tags]
  );

  if (!isOpen) return null;

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags((prev) => [...prev, trimmed]);
  };

  const removeTag = (value: string) => {
    setTags((prev) => prev.filter((tag) => tag !== value));
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',' || event.key === 'Tab') {
      event.preventDefault();
      if (tagDraft.trim()) {
        addTag(tagDraft);
        setTagDraft('');
      }
    } else if (event.key === 'Backspace' && !tagDraft && tags.length > 0) {
      event.preventDefault();
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedDraft = tagDraft.trim();
    const finalTags = trimmedDraft && !tags.includes(trimmedDraft) ? [...tags, trimmedDraft] : tags;
    onSave({ shortcut, phrase, tags: finalTags });
    setTagDraft('');
    setTags(finalTags);
  };

  const isDisabled = !shortcut.trim() && !phrase.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
      <div className="w-full max-w-xl rounded-3xl border border-slate-700/60 bg-slate-900/90 p-6 shadow-2xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-100">{title}</h3>
            <p className="mt-1 text-sm text-slate-400">
              Shortcut is treated as the unique key. Tags are optional and can help with filtering.
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
          <div className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Tags
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full bg-violet-500/40 px-3 py-1 text-xs font-semibold text-violet-100"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-violet-100/80 transition-transform duration-150 hover:scale-110"
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type and press Enter"
                className="min-w-[120px] flex-1 bg-transparent py-1 text-sm text-slate-100 focus:outline-none"
              />
            </div>
            {normalizedAvailableTags.length > 0 ? (
              <div className="flex flex-wrap gap-2 text-xs text-slate-200">
                {normalizedAvailableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="rounded-full bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-200 transition-colors duration-150 hover:bg-slate-700"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
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
