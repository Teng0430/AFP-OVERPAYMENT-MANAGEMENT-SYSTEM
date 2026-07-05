import apiClient from './api';
import type { Pensioner } from '../types';
import type { PaginationMeta } from '../types';

export interface PensionerFilters {
  page?: number;
  per_page?: number;
  search?: string;
  rank?: string[];
  agency_name?: string[];
  status?: string[];
  cause_of_stoppage?: string[];
  year?: number;
  month?: number;
  recovery_status?: string;
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface PensionerListResponse {
  pensioners: Pensioner[];
  meta: PaginationMeta;
}

export async function list(filters?: PensionerFilters): Promise<PensionerListResponse> {
  const data = await apiClient.get('/pensioners', { params: filters }) as PensionerListResponse;
  return data;
}

export async function get(id: number): Promise<Pensioner> {
  const data = await apiClient.get(`/pensioners/${id}`) as { pensioner: Pensioner };
  return data.pensioner;
}

export async function create(payload: Partial<Pensioner>): Promise<Pensioner> {
  const data = await apiClient.post('/pensioners', payload) as { pensioner: Pensioner };
  return data.pensioner;
}

export async function update(id: number, payload: Partial<Pensioner>): Promise<Pensioner> {
  const data = await apiClient.put(`/pensioners/${id}`, payload) as { pensioner: Pensioner };
  return data.pensioner;
}

export async function remove(id: number): Promise<void> {
  await apiClient.delete(`/pensioners/${id}`);
}

export async function bulkDelete(ids: number[]): Promise<void> {
  await apiClient.post('/pensioners/bulk-delete', { ids });
}

export async function bulkUpdate(ids: number[], data: Partial<Pensioner>): Promise<void> {
  await apiClient.post('/pensioners/bulk-update', { ids, data });
}
