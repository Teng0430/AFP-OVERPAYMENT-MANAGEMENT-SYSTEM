import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../src/hooks/useAuth';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import LoginPage from '../../src/pages/LoginPage';

function TestChild() {
  return <div>Protected Content</div>;
}

function renderInRouter(ui: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={ui} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('redirects to login when unauthenticated', () => {
    renderInRouter(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );
    expect(screen.getByText(/AFP Pension Overpayment/i)).toBeInTheDocument();
    expect(screen.queryByText(/Protected Content/i)).not.toBeInTheDocument();
  });
});
