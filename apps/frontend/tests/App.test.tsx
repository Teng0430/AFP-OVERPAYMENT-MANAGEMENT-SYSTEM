import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../src/pages/HomePage';
import NotFoundPage from '../src/pages/NotFoundPage';

describe('HomePage', () => {
  it('renders the home page heading', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('IDS')).toBeInTheDocument();
  });
});

describe('NotFoundPage', () => {
  it('renders 404 page heading', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('404')).toBeInTheDocument();
  });
});
