import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ReportsPage from '../../src/pages/ReportsPage';
import { AuthProvider } from '../../src/hooks/useAuth';
import { MemoryRouter } from 'react-router-dom';

function renderWithAuth(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ReportsPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithAuth(<ReportsPage />);
    expect(container.querySelector('.space-y-6')).toBeInTheDocument();
  });

  it('renders heading with Reports text', () => {
    renderWithAuth(<ReportsPage />);
    const headings = screen.getAllByRole('heading');
    expect(headings.some((h) => h.textContent?.includes('Reports'))).toBe(true);
  });

  it('renders export buttons', () => {
    renderWithAuth(<ReportsPage />);
    const buttons = screen.getAllByRole('button');
    const buttonTexts = buttons.map((b) => b.textContent ?? '');
    expect(buttonTexts.some((t) => t.includes('PDF'))).toBe(true);
    expect(buttonTexts.some((t) => t.includes('CSV'))).toBe(true);
  });

  it('renders chart tab elements', () => {
    renderWithAuth(<ReportsPage />);
    const tabTriggers = screen.getAllByRole('tab');
    const tabTexts = tabTriggers.map((t) => t.textContent ?? '');
    expect(tabTexts.some((t) => t.includes('Agency Summary'))).toBe(true);
    expect(tabTexts.some((t) => t.includes('Rank Summary'))).toBe(true);
    expect(tabTexts.some((t) => t.includes('Status Distribution'))).toBe(true);
  });
});
