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
<<<<<<< HEAD
  const endpoint = params.format === 'csv' ? '/reports/export-csv' : '/reports/export-pdf';
  const response = await apiClient.get(endpoint, {
    params: {
      type: params.type === 'custom' ? 'all' : params.type,
      date_from: params.date_from,
      date_to: params.date_to,
    },
=======
  const response = await apiClient.get('/reports/export', {
    params,
>>>>>>> 885f6e46fde5ccc3d66d67570c482cdded90d7da
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
<<<<<<< HEAD
  return getDownloadUrl(`/reports/export-pdf?${query.toString()}`);
=======
  return getDownloadUrl(`/reports/export?${query.toString()}`);
>>>>>>> 885f6e46fde5ccc3d66d67570c482cdded90d7da
}
