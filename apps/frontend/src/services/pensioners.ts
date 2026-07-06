import apiClient from './api';
import type { Pensioner, AgencyDeduction } from '../types';
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

export interface CreatePensionerPayload {
  rank: string;
  name: string;
  serial_number: string;
  account_number?: string;
  date_of_death: string;
  last_payment: string;
  cause_of_stoppage: string;
  agency_name: string;
  monthly_pension: number;
  agency_deduction?: number;
  agency_deductions?: AgencyDeduction[];
  amount_collected: number;
  date_collected?: string;
  status: string;
}

export async function list(filters?: PensionerFilters): Promise<PensionerListResponse> {
  const data = await apiClient.get('/pensioners', { params: filters }) as PensionerListResponse;
  return data;
}

export async function get(id: number): Promise<Pensioner> {
  const data = await apiClient.get(`/pensioners/${id}`) as { pensioner: Pensioner };
  return data.pensioner;
}

export async function create(payload: CreatePensionerPayload | Partial<Pensioner>): Promise<Pensioner> {
  const normalized = { ...payload };

  if (normalized.agency_deductions && normalized.agency_deductions.length > 0) {
    normalized.agency_deductions = normalized.agency_deductions.map((d, i) => ({
      ...d,
      crediting_agency: i === 0,
    }));
  }

  const data = await apiClient.post('/pensioners', normalized) as { pensioner: Pensioner };
  return data.pensioner;
}

export async function update(id: number, payload: Partial<Pensioner>): Promise<Pensioner> {
  const normalized = { ...payload };

  if (normalized.agency_deductions && normalized.agency_deductions.length > 0) {
    normalized.agency_deductions = normalized.agency_deductions.map((d, i) => ({
      ...d,
      crediting_agency: i === 0,
    }));
  }

  const data = await apiClient.put(`/pensioners/${id}`, normalized) as { pensioner: Pensioner };
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
