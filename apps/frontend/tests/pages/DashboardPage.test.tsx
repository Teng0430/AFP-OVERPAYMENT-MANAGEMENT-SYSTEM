import { render } from '@testing-library/react';
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
  it('renders without crashing', () => {
    const { container } = renderWithAuth(<DashboardPage />);
    expect(container.querySelector('.space-y-6')).toBeInTheDocument();
  });
});
