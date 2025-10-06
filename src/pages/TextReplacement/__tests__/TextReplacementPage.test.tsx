import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import TextReplacementPage from '..';

beforeEach(() => {
  window.localStorage.clear();
});

describe('TextReplacementPage', () => {
  it('allows creating and searching entries', async () => {
    render(<TextReplacementPage />);

    expect(screen.getByText('No entries yet')).toBeInTheDocument();

    const newEntryButtons = screen.getAllByText('New entry');
    fireEvent.click(newEntryButtons[newEntryButtons.length - 1]);

    const shortcutField = screen.getAllByLabelText('Shortcut').slice(-1)[0];
    const phraseField = screen.getAllByLabelText('Phrase').slice(-1)[0];
    fireEvent.change(shortcutField, { target: { value: 'hello' } });
    fireEvent.change(phraseField, { target: { value: 'Hello world' } });

    const saveButtons = screen.getAllByRole('button', { name: /^save$/i });
    fireEvent.click(saveButtons[saveButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getAllByText('hello').length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText('Search shortcut or phrase');
    fireEvent.change(searchInput, { target: { value: 'zzz' } });

    expect(screen.getByText('No entries yet')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'hello' } });

    await waitFor(() => {
      expect(screen.getByText('hello')).toBeInTheDocument();
    });
  });

});
