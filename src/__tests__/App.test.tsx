import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App counter behaviour', () => {
  it('increments and decrements count when buttons are clicked', async () => {
    render(<App />);

    const incrementButton = screen.getByRole('button', { name: '+1' });
    const decrementButton = screen.getByRole('button', { name: '-1' });
    const resetButton = screen.getByRole('button', { name: 'Reset' });

    await userEvent.click(incrementButton);
    await userEvent.click(incrementButton);
    await userEvent.click(decrementButton);

    expect(screen.getByText('1')).toBeInTheDocument();

    await userEvent.click(resetButton);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
