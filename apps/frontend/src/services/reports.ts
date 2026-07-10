import apiClient, { getDownloadUrl } from './api';
import type { AxiosResponse } from 'axios';

export interface ReportParams {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
  date_from?: string;
  date_to?: string;
  format: 'pdf' | 'excel' | 'csv' | 'print';
  group_by?: 'rank' | 'agency' | 'status' | 'cause';
}

export async function generate(params: ReportParams): Promise<Blob> {
  const response = await apiClient.get('/reports/export', {
    params,
    responseType: 'blob',
  }) as AxiosResponse;

  return response.data as Blob;
}

export function getGenerateUrl(params: ReportParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      query.append(key, String(value));
    }
  });
  return getDownloadUrl(`/reports/export?${query.toString()}`);
}
