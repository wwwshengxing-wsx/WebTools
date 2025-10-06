import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StoragePage from '..';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-01-01T10:00:00.000Z'));
  if (!crypto.randomUUID) {
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'storage-id'),
    });
  }
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('StoragePage', () => {
  it('supports adding, editing, and deleting entries', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<StoragePage />);

    const addFormHeading = screen
      .getAllByRole('heading', { name: /add new entry/i })
      .slice(-1)[0];
    const addForm = addFormHeading.closest('form');
    if (!addForm) throw new Error('Add form not found');

    await user.type(within(addForm).getByLabelText(/^key$/i), 'theme');
    await user.type(within(addForm).getByLabelText(/^value$/i), 'dark');
    await user.click(within(addForm).getByRole('button', { name: /save to storage/i }));

    const entryHeading = await screen.findByText(/theme/i);
    expect(entryHeading).toBeInTheDocument();
    expect(screen.getByText(/dark/i)).toBeInTheDocument();

    const listItem = entryHeading.closest('li');
    if (!listItem) throw new Error('List item not found');

    await user.click(within(listItem).getByRole('button', { name: /edit/i }));

    const editKeyInput = within(listItem).getByLabelText(/^key$/i);
    const editValueInput = within(listItem).getByLabelText(/^value$/i);

    await user.clear(editKeyInput);
    await user.type(editKeyInput, 'theme');
    await user.clear(editValueInput);
    await user.type(editValueInput, 'light');
    await user.click(within(listItem).getByRole('button', { name: /save changes/i }));

    expect(within(listItem).getByText(/light/i)).toBeInTheDocument();

    await user.click(within(listItem).getByRole('button', { name: /delete/i }));
    expect(screen.queryByText(/theme/i)).not.toBeInTheDocument();
  });

  it('clears all entries', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<StoragePage />);

    const addFormHeading = screen
      .getAllByRole('heading', { name: /add new entry/i })
      .slice(-1)[0];
    const addForm = addFormHeading.closest('form');
    if (!addForm) throw new Error('Add form not found');

    await user.type(within(addForm).getByLabelText(/^key$/i), 'flag');
    await user.type(within(addForm).getByLabelText(/^value$/i), 'true');
    await user.click(within(addForm).getByRole('button', { name: /save to storage/i }));

    expect(await screen.findByText(/flag/i)).toBeInTheDocument();

    await user.click(
      screen.getAllByRole('button', { name: /clear all/i }).slice(-1)[0]
    );
    expect(screen.queryByText(/flag/i)).not.toBeInTheDocument();
  });
});
