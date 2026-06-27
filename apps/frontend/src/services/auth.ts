import apiClient from './api';
import type { AuthResponse, User } from '../types/user';

export async function login(email: string, password: string): Promise<AuthResponse> {
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
  await apiClient.post('/logout');
  localStorage.removeItem('auth_token');
}

export async function getUser(): Promise<User> {
  const data = await apiClient.get('/user') as { user: User };
  return data.user;
}
