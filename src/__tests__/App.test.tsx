import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import App from '../App';
import CounterPage from '../pages/CounterPage';

describe('App routing shell', () => {
  it('renders the counter page on the root route', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <App />,
          children: [
            {
              index: true,
              element: <CounterPage />,
            },
          ],
        },
      ],
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole('heading', { name: /interactive counter/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /counter/i })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});
