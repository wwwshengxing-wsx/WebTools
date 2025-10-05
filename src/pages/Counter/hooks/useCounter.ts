import { useCallback, useState } from 'react';

export interface UseCounterOptions {
  initialValue?: number;
}

export interface UseCounterResult {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export function useCounter(options: UseCounterOptions = {}): UseCounterResult {
  const { initialValue = 0 } = options;
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount((prev) => prev - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}
