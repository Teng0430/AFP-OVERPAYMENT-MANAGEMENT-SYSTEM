import apiClient from './api';
import type { Alert, AlertSeverity, AlertType } from '../types';

export interface AlertFilters {
  severity?: AlertSeverity;
  is_read?: boolean;
  type?: AlertType;
}

export async function list(filters?: AlertFilters): Promise<{ alerts: Alert[] }> {
  const data = await apiClient.get('/alerts', { params: filters }) as { alerts: Alert[] };
  return data;
}

export async function markRead(id: number): Promise<void> {
  await apiClient.post(`/alerts/${id}/read`);
}

export async function markAllRead(): Promise<void> {
  await apiClient.post('/alerts/read-all');
}
