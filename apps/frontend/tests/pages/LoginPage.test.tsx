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
  it('renders sign in heading', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getAllByRole('heading', { name: /sign in/i })[0]).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getAllByLabelText(/email/i)[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText(/password/i)[0]).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getAllByRole('button', { name: /sign in/i })[0]).toBeInTheDocument();
  });

  it('renders link to register page', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getAllByRole('link', { name: /register/i })[0]).toBeInTheDocument();
  });

  it('shows logout message when query param present', () => {
    window.history.pushState({}, '', '/login?logout=Logged+out+successfully.');
    renderWithProviders(<LoginPage />);
    expect(screen.getAllByText(/logged out successfully/i)[0]).toBeInTheDocument();
  });
});
