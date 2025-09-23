import { useState } from 'react';
import './App.css';

export default function App(): JSX.Element {
  const [count, setCount] = useState(0);

  return (
    <main className="counter-app">
      <h1 className="heading">React Counter</h1>
      <p className="counter-value" aria-live="polite">
        {count}
      </p>
      <div className="button-row">
        <button type="button" onClick={() => setCount((prev) => prev + 1)}>
          +1
        </button>
        <button type="button" onClick={() => setCount((prev) => prev - 1)}>
          -1
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => setCount(0)}
        >
          Reset
        </button>
      </div>
    </main>
  );
}
