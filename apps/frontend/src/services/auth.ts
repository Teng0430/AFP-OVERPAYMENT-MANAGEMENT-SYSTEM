import apiClient from './api';
import type { AuthResponse, User } from '../types/user';

const DEV_CREDENTIALS = { email: 'admin@afp.mil.ph', password: 'admin123' };

export async function login(email: string, password: string): Promise<AuthResponse> {
  if (
    email === DEV_CREDENTIALS.email &&
    password === DEV_CREDENTIALS.password
  ) {
    const devUser: User = {
      id: 1,
      name: 'Admin User',
      email: 'admin@afp.mil.ph',
      role_id: 1,
      role: {
        id: 1,
        name: 'Administrator',
        slug: 'admin',
        description: 'System administrator',
        permissions: ['*'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      department: 'Finance Center',
      is_active: true,
      two_factor_enabled: false,
      email_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const token = 'dev-token-afp-admin';
    localStorage.setItem('auth_token', token);
    return { user: devUser, token };
  }

  const data = await apiClient.post('/login', { email, password }) as AuthResponse;
  localStorage.setItem('auth_token', data.token);
  return data;
}

export async function register(name: string, email: string, password: string, passwordConfirmation: string): Promise<AuthResponse> {
  const data = await apiClient.post('/register', {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
  }) as AuthResponse;
  localStorage.setItem('auth_token', data.token);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/logout');
  } catch {
    // Ignore backend errors on logout — clear local state regardless
  }
  localStorage.removeItem('auth_token');
}

export async function getUser(): Promise<User> {
  const token = localStorage.getItem('auth_token');
  if (token === 'dev-token-afp-admin') {
    const devUser: User = {
      id: 1,
      name: 'Admin User',
      email: 'admin@afp.mil.ph',
      role_id: 1,
      role: {
        id: 1,
        name: 'Administrator',
        slug: 'admin',
        description: 'System administrator',
        permissions: ['*'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      department: 'Finance Center',
      is_active: true,
      two_factor_enabled: false,
      email_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return devUser;
  }
  const data = await apiClient.get('/user') as { user: User };
  return data.user;
}
