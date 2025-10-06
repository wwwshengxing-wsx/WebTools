import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useTextReplacementEntries } from '../useTextReplacementEntries';

const resetStorage = () => {
  window.localStorage.clear();
};

describe('useTextReplacementEntries', () => {
  beforeEach(() => {
    resetStorage();
  });

  it('creates and updates entries while tracking history', async () => {
    const { result } = renderHook(() => useTextReplacementEntries());

    act(() => {
      result.current.saveEntry({ shortcut: 'greet', phrase: 'Hello world' });
    });

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(1);
    });

    expect(result.current.historyEntries[0]?.type).toBe('create');

    const entryId = result.current.entries[0]?.id as string;

    act(() => {
      result.current.saveEntry({ id: entryId, shortcut: 'greet', phrase: 'Hi there' });
    });

    await waitFor(() => {
      expect(result.current.entries[0]?.phrase).toBe('Hi there');
    });

    expect(result.current.historyEntries[0]?.type).toBe('update');
  });

  it('prepares import preview and merges selected entries', async () => {
    const { result } = renderHook(() => useTextReplacementEntries());

    act(() => {
      result.current.saveEntry({ shortcut: 'base', phrase: 'Original' });
    });

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(1);
    });

    act(() => {
      result.current.prepareImportPreview(
        [
          { shortcut: 'base', phrase: 'Updated phrase' },
          { shortcut: 'extra', phrase: 'Additional' },
        ],
        'demo.xml'
      );
    });

    expect(result.current.importPreview?.items).toHaveLength(2);

    act(() => {
      result.current.confirmImportSelection();
    });

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(2);
    });

    const updated = result.current.entries.find((entry) => entry.shortcut === 'base');
    const created = result.current.entries.find((entry) => entry.shortcut === 'extra');

    expect(updated?.phrase).toBe('Updated phrase');
    expect(created?.phrase).toBe('Additional');
    expect(result.current.historyEntries[0]?.type).toBe('import');
    expect(result.current.importPreview).toBeNull();
  });

  it('undoes a selected history entry snapshot', async () => {
    const { result } = renderHook(() => useTextReplacementEntries());

    act(() => {
      result.current.saveEntry({ shortcut: 'undo-me', phrase: 'Initial' });
    });

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(1);
    });

    act(() => {
      result.current.saveEntry({ shortcut: 'another', phrase: 'Second' });
    });

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(2);
    });

    const targetHistoryId = result.current.historyEntries[0]?.id as string;

    act(() => {
      result.current.undoHistory(targetHistoryId);
    });

    await waitFor(() => {
      expect(result.current.historyEntries[0]?.type).toBe('undo');
    });

    expect(result.current.entries).toHaveLength(1);
  });
});
