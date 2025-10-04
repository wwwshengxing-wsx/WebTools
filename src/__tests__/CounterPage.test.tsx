import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CounterPage from '../pages/CounterPage';

describe('CounterPage', () => {
  it('allows increment, decrement, and reset actions', async () => {
    render(<CounterPage />);

    const counterValue = screen.getByRole('status', {
      name: /counter value/i,
    });
    const incrementButton = screen.getByRole('button', { name: '+1' });
    const decrementButton = screen.getByRole('button', { name: '-1' });
    const resetButton = screen.getByRole('button', { name: 'Reset' });

    await userEvent.click(incrementButton);
    await userEvent.click(incrementButton);
    await userEvent.click(decrementButton);

    expect(counterValue).toHaveTextContent('1');

    await userEvent.click(resetButton);
    expect(counterValue).toHaveTextContent('0');

    await userEvent.click(decrementButton);
    expect(counterValue).toHaveTextContent('-1');
  });
});
