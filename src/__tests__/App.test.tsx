import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { routes } from '../router';

describe('App routing shell', () => {
  it('renders the home directory on the root route', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole('heading', { name: /feature directory/i })
    ).toBeInTheDocument();
    const primaryNav = screen.getByRole('navigation', { name: /primary/i });
    const overviewLink = within(primaryNav).getByRole('link', { name: /overview/i });
    expect(overviewLink).toHaveAttribute('aria-current', 'page');
  });

  it('activates the counter navigation link on /counter', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/counter'] });

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole('heading', { name: /interactive counter/i })
    ).toBeInTheDocument();
    const primaryNav = screen.getByRole('navigation', { name: /primary/i });
    const counterLink = within(primaryNav).getByRole('link', { name: /counter/i });
    expect(counterLink).toHaveAttribute('aria-current', 'page');
  });

  it('activates the storage navigation link on /storage', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/storage'] });

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole('heading', { name: /browser storage explorer/i })
    ).toBeInTheDocument();
    const primaryNav = screen.getByRole('navigation', { name: /primary/i });
    const storageLink = within(primaryNav).getByRole('link', { name: /storage/i });
    expect(storageLink).toHaveAttribute('aria-current', 'page');
  });
});
