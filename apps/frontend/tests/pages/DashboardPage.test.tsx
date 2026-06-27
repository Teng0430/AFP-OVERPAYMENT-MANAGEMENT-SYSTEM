import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DashboardPage from '../../src/pages/DashboardPage';
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

describe('DashboardPage', () => {
  it('renders welcome heading', () => {
    renderWithAuth(<DashboardPage />);
    expect(screen.getAllByRole('heading', { name: /welcome/i })[0]).toBeInTheDocument();
  });
});
