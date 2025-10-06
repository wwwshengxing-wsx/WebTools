import { describe, it, expect } from 'vitest';
import { router, routes } from '../router';

describe('router configuration', () => {
  it('registers overview, counter, storage, and text replacement routes', () => {
    const rootRoute = routes.find((route) => route.path === '/');

    expect(rootRoute).toBeTruthy();
    expect(rootRoute?.children).toHaveLength(4);

    const [homeRoute, counterRoute, storageRoute, textReplacementRoute] =
      rootRoute?.children ?? [];
    expect(homeRoute?.index).toBe(true);
    expect(counterRoute?.path).toBe('counter');
    expect(storageRoute?.path).toBe('storage');
    expect(textReplacementRoute?.path).toBe('text-replacement');
  });

  it('mirrors the same configuration on the router instance', () => {
    expect(router.routes).toHaveLength(1);
    const children = router.routes[0]?.children ?? [];
    expect(children).toHaveLength(4);
    expect(children.some((route) => route.index)).toBe(true);
    expect(children.some((route) => route.path === 'counter')).toBe(true);
    expect(children.some((route) => route.path === 'storage')).toBe(true);
    expect(children.some((route) => route.path === 'text-replacement')).toBe(true);
  });
});
