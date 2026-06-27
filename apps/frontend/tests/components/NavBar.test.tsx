import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/hooks/useAuth';
import NavBar from '../../src/components/NavBar';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('NavBar', () => {
  it('renders navigation role', () => {
    renderWithProviders(<NavBar />);
    expect(screen.getAllByRole('navigation')[0]).toBeInTheDocument();
  });

  it('renders user menu button', () => {
    renderWithProviders(<NavBar />);
    expect(screen.getAllByLabelText(/user menu/i)[0]).toBeInTheDocument();
  });

  it('renders IDS brand name', () => {
    renderWithProviders(<NavBar />);
    expect(screen.getAllByText('IDS')[0]).toBeInTheDocument();
  });
});
