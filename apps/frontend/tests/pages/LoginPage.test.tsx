import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoginPage from '../../src/pages/LoginPage';
import { AuthProvider } from '../../src/hooks/useAuth';
import { MemoryRouter } from 'react-router-dom';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  it('renders system title', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText(/AFP Pension Overpayment/i)).toBeInTheDocument();
    expect(screen.getByText(/Monitoring System/i)).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getAllByTestId('password-input').length).toBeGreaterThan(0);
  });

  it('renders submit button', () => {
    renderWithProviders(<LoginPage />);
    const buttons = screen.getAllByRole('button', { name: /sign in/i });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders security badges', () => {
    renderWithProviders(<LoginPage />);
    const secureLogins = screen.getAllByText(/Secure Login/i);
    expect(secureLogins.length).toBeGreaterThan(0);
    const rbac = screen.getAllByText(/RBAC Enabled/i);
    expect(rbac.length).toBeGreaterThan(0);
  });

  it('renders AFP Finance Center footer', () => {
    renderWithProviders(<LoginPage />);
    const footers = screen.getAllByText(/Finance Center/i);
    expect(footers.length).toBeGreaterThan(0);
    const armedForces = screen.getAllByText(/Armed Forces of the Philippines/i);
    expect(armedForces.length).toBeGreaterThan(0);
  });

  it('shows logout message when query param present', () => {
    render(
      <MemoryRouter initialEntries={['/login?logout=Logged+out+successfully.']}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/logged out successfully/i)).toBeInTheDocument();
  });
});
