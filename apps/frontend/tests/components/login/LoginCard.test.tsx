import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginCard from '../../../src/components/login/LoginCard';

describe('LoginCard', () => {
  const mockSubmit = vi.fn();

  it('renders email and password inputs', () => {
    render(<LoginCard onSubmit={mockSubmit} isLoading={false} />);
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getAllByTestId('password-input').length).toBeGreaterThan(0);
  });

  it('renders show/hide password toggle', () => {
    render(<LoginCard onSubmit={mockSubmit} isLoading={false} />);
    const toggles = screen.getAllByRole('button', { name: /show password/i });
    expect(toggles.length).toBeGreaterThan(0);
  });

  it('renders sign in button', () => {
    render(<LoginCard onSubmit={mockSubmit} isLoading={false} />);
    const buttons = screen.getAllByRole('button', { name: /sign in/i });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders forgot password link', () => {
    render(<LoginCard onSubmit={mockSubmit} isLoading={false} />);
    const links = screen.getAllByText(/forgot password/i);
    expect(links.length).toBeGreaterThan(0);
  });

  it('renders need help link', () => {
    render(<LoginCard onSubmit={mockSubmit} isLoading={false} />);
    const links = screen.getAllByText(/need help/i);
    expect(links.length).toBeGreaterThan(0);
  });

  it('renders remember me checkbox', () => {
    render(<LoginCard onSubmit={mockSubmit} isLoading={false} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('shows loading state when authenticating', () => {
    render(<LoginCard onSubmit={mockSubmit} isLoading={true} error={null} />);
    expect(screen.getByText(/authenticating/i)).toBeInTheDocument();
    const buttons = screen.getAllByRole('button', { name: /authenticating/i });
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach(b => expect(b).toBeDisabled());
  });

  it('shows caps lock warning when caps is on', () => {
    render(<LoginCard onSubmit={mockSubmit} isLoading={false} />);
    const passwordInput = screen.getAllByTestId('password-input').find(el => el.isConnected)!;
    const originalGetModifierState = KeyboardEvent.prototype.getModifierState;
    KeyboardEvent.prototype.getModifierState = function () { return true; };
    fireEvent.keyDown(passwordInput, { key: 'a' });
    KeyboardEvent.prototype.getModifierState = originalGetModifierState;
    const warnings = screen.getAllByText(/caps lock is on/i);
    expect(warnings.length).toBeGreaterThan(0);
  });
});
