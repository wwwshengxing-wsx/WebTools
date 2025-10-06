import { describe, it, expect, afterEach, vi } from 'vitest';
import { act } from '@testing-library/react';

describe('main bootstrap', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.resetModules();
  });

  it('renders the React app into the root element', async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await import('../main');

    await act(async () => {
      await Promise.resolve();
    });
    const root = document.getElementById('root');
    expect(root?.childElementCount ?? 0).toBeGreaterThan(0);
  });
});
