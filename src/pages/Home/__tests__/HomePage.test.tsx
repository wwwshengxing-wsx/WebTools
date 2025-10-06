import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '..';

describe('HomePage directory', () => {
  it('lists available feature links', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /feature directory/i })
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /^counter\b/i })).toHaveAttribute(
      'href',
      '/counter'
    );
    expect(screen.getByRole('link', { name: /^storage\b/i })).toHaveAttribute(
      'href',
      '/storage'
    );
    expect(
      screen.getByRole('link', { name: /^text replacement\b/i })
    ).toHaveAttribute('href', '/text-replacement');
  });
});
