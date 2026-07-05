import apiClient, { uploadFile } from './api';
import type { Setting } from '../types';

export async function getAll(): Promise<{ settings: Setting[] }> {
  const data = await apiClient.get('/settings') as { settings: Setting[] };
  return data;
}

export async function update(
  settings: { group: string; key: string; value: string }[],
): Promise<void> {
  await apiClient.put('/settings', { settings });
}

export async function backup(): Promise<void> {
  await apiClient.post('/settings/backup');
}

export async function restore(file: File): Promise<void> {
  await uploadFile('/settings/restore', file);
}
