import { describe, it, expect } from 'vitest';
import { router, routes } from '../router';

describe('router configuration', () => {
  it('exposes the counter page as the root index route', () => {
    const rootRoute = routes.find((route) => route.path === '/');

    expect(rootRoute).toBeTruthy();
    expect(rootRoute?.children).toHaveLength(1);
    expect(rootRoute?.children?.[0]?.index).toBe(true);
  });

  it('matches the rendered routes within the router instance', () => {
    expect(router.routes).toHaveLength(1);
    expect(router.routes[0]?.children?.[0]?.index).toBe(true);
  });
});
