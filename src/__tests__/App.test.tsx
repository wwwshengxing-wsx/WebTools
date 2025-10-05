import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import App from '../App';
import CounterPage from '../pages/CounterPage';

describe('App routing shell', () => {
  const routes = [
    {
      path: '/',
      element: <App />,
      children: [
        {
          index: true,
          element: <CounterPage />,
        },
        {
          path: 'other',
          element: <div>Other Route</div>,
        },
      ],
    },
  ];

  it('renders the counter page on the root route', () => {
    const router = createMemoryRouter(
      routes,
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole('heading', { name: /interactive counter/i })
    ).toBeInTheDocument();
    const links = screen.getAllByRole('link', { name: /counter/i });
    expect(links.some((link) => link.getAttribute('aria-current') === 'page')).toBe(
      true
    );
  });

  it('marks the navigation link inactive on non-root routes', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/other'] });

    render(<RouterProvider router={router} />);

    const links = screen.getAllByRole('link', { name: /counter/i });
    const lastLink = links[links.length - 1];
    expect(lastLink?.hasAttribute('aria-current')).toBe(false);
  });
});
