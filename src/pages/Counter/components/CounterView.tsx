export interface CounterViewProps {
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
}

export default function CounterView({
  count,
  onIncrement,
  onDecrement,
  onReset,
}: CounterViewProps): JSX.Element {
  const primaryButtonClasses =
    'rounded-full bg-sky-400 px-6 py-3 text-base font-semibold text-slate-900 shadow-sm transition-all duration-150 hover:translate-y-[-2px] hover:shadow-[0_10px_25px_rgba(56,189,248,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 active:translate-y-0 active:shadow-[0_4px_12px_rgba(15,23,42,0.3)]';
  const secondaryButtonClasses =
    'rounded-full bg-slate-200 px-6 py-3 text-base font-semibold text-slate-900 shadow-sm transition-all duration-150 hover:translate-y-[-2px] hover:shadow-[0_10px_25px_rgba(148,163,184,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200 active:translate-y-0 active:shadow-[0_4px_12px_rgba(15,23,42,0.3)]';

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p
        className="text-6xl font-bold tracking-tight text-slate-100"
        role="status"
        aria-live="polite"
        aria-label="Counter value"
      >
        {count}
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <button type="button" className={primaryButtonClasses} onClick={onIncrement}>
          +1
        </button>
        <button type="button" className={primaryButtonClasses} onClick={onDecrement}>
          -1
        </button>
        <button type="button" className={secondaryButtonClasses} onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
