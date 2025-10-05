import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../useCounter';

describe('useCounter', () => {
  it('returns the provided initial value', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 5 }));

    expect(result.current.count).toBe(5);
  });

  it('increments, decrements, and resets correctly', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 2 }));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.decrement();
    });

    expect(result.current.count).toBe(3);

    act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(2);
  });
});
