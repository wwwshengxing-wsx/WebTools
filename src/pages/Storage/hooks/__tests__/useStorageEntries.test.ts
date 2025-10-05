import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStorageEntries } from '../useStorageEntries';
import type { StorageEntry } from '../useStorageEntries';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-01-01T10:00:00.000Z'));
  if (!crypto.randomUUID) {
    vi.stubGlobal('crypto', {
      randomUUID: () => 'mock-id-1',
    });
  }
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useStorageEntries', () => {
  it('adds a new entry and persists to localStorage', () => {
    const { result } = renderHook(() => useStorageEntries());

    act(() => {
      result.current.addEntry({ key: 'feature', value: 'enabled' });
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0]).toMatchObject({
      key: 'feature',
      value: 'enabled',
    });

    const raw = localStorage.getItem('app.storage.entries') ?? '[]';
    const persisted = JSON.parse(raw) as StorageEntry[];
    expect(Array.isArray(persisted)).toBe(true);
    expect(persisted).toHaveLength(1);
    expect(persisted[0]?.key).toBe('feature');
  });

  it('updates an existing entry when adding the same key twice', () => {
    const { result } = renderHook(() => useStorageEntries());

    act(() => {
      result.current.addEntry({ key: 'flag', value: 'on' });
    });

    vi.setSystemTime(new Date('2024-01-01T11:00:00.000Z'));

    act(() => {
      result.current.addEntry({ key: 'flag', value: 'off' });
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].value).toBe('off');
    expect(result.current.entries[0].updatedAt).toBe('2024-01-01T11:00:00.000Z');
  });

  it('removes and clears entries', () => {
    const { result } = renderHook(() => useStorageEntries());

    act(() => {
      result.current.addEntry({ key: 'a', value: '1' });
      result.current.addEntry({ key: 'b', value: '2' });
    });

    const firstEntry = result.current.entries[0];
    expect(firstEntry).toBeDefined();

    if (!firstEntry) {
      throw new Error('Expected an entry to exist');
    }

    act(() => {
      result.current.removeEntry(firstEntry.id);
    });

    expect(result.current.entries).toHaveLength(1);

    act(() => {
      result.current.clearEntries();
    });

    expect(result.current.entries).toHaveLength(0);
    expect(localStorage.getItem('app.storage.entries')).toBe('[]');
  });
});
