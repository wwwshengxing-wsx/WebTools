import { useMemo } from 'react';

interface TextEditorProps {
  value: string;
  onChange: (next: string) => void;
}

export function TextEditor({ value, onChange }: TextEditorProps): JSX.Element {
  const lineCount = useMemo(() => (value === '' ? 1 : value.split('\n').length), [value]);
  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, index) => index + 1),
    [lineCount],
  );

  return (
    <div className="flex h-full w-full rounded-lg border border-slate-700 bg-slate-950/90 shadow-inner shadow-slate-950/70">
      <div
        className="flex select-none flex-col items-end gap-0.5 overflow-hidden border-r border-slate-800 bg-slate-900/80 px-3 py-3 text-xs text-slate-600"
        aria-hidden="true"
      >
        {lineNumbers.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full flex-1 resize-none bg-transparent px-4 py-3 font-mono text-sm text-slate-100 outline-none"
        aria-label="JSON input"
        spellCheck={false}
      />
    </div>
  );
}
