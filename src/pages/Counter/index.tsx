import CounterView from './components/CounterView';
import { useCounter } from './hooks/useCounter';

export default function CounterPage(): JSX.Element {
  const { count, increment, decrement, reset } = useCounter();

  return (
    <section
      className="w-full max-w-xl rounded-3xl bg-slate-900/60 px-6 py-10 shadow-[0_40px_70px_rgba(2,6,23,0.45)] backdrop-blur-2xl sm:px-10"
      aria-labelledby="counter-heading"
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <h2
          id="counter-heading"
          className="text-3xl font-semibold tracking-wide text-slate-100 sm:text-4xl"
        >
          Interactive Counter
        </h2>
        <p className="max-w-md text-base text-slate-200/80">
          Adjust the value, explore interactions, and reset anytime.
        </p>
        <CounterView
          count={count}
          onIncrement={increment}
          onDecrement={decrement}
          onReset={reset}
        />
      </div>
    </section>
  );
}
