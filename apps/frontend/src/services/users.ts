import apiClient from './api';
import type { User, Role } from '../types';

export async function list(): Promise<{ users: User[] }> {
  const data = await apiClient.get('/users') as { users: User[] };
  return data;
}

export async function create(payload: {
  name: string;
  email: string;
  password: string;
  role_id: number;
  department?: string;
  is_active?: boolean;
}): Promise<User> {
  const data = await apiClient.post('/users', payload) as { user: User };
  return data.user;
}

export async function update(
  id: number,
  payload: Partial<{
    name: string;
    email: string;
    role_id: number;
    department: string;
    is_active: boolean;
  }>,
): Promise<User> {
  const data = await apiClient.put(`/users/${id}`, payload) as { user: User };
  return data.user;
}

export async function remove(id: number): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}

export async function resetPassword(id: number): Promise<void> {
  await apiClient.post(`/users/${id}/reset-password`);
}

export async function toggle2fa(id: number): Promise<{ two_factor_enabled: boolean }> {
  const data = await apiClient.post(`/users/${id}/toggle-2fa`) as { two_factor_enabled: boolean };
  return data;
}

export async function getRoles(): Promise<{ roles: Role[] }> {
  const data = await apiClient.get('/roles') as { roles: Role[] };
  return data;
}

export async function getRoleMatrix(): Promise<{ matrix: Record<string, string[]> }> {
  const data = await apiClient.get('/roles/matrix') as { matrix: Record<string, string[]> };
  return data;
}
