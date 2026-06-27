import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RegisterPage from '../../src/pages/RegisterPage';
import { AuthProvider } from '../../src/hooks/useAuth';
import { MemoryRouter } from 'react-router-dom';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  it('renders create account heading', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getAllByRole('heading', { name: /create account/i })[0]).toBeInTheDocument();
  });

  it('renders name, email, password, and confirm password fields', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getAllByLabelText(/^name/i)[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^email/i)[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^password/i)[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText(/confirm password/i)[0]).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getAllByRole('button', { name: /create account/i })[0]).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getAllByRole('link', { name: /sign in/i })[0]).toBeInTheDocument();
  });
});
