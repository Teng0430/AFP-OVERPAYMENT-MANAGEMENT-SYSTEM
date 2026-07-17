import apiClient, { getDownloadUrl } from './api';

export interface ReportParams {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
  date_from?: string;
  date_to?: string;
  format: 'pdf' | 'excel' | 'csv' | 'print';
  group_by?: 'rank' | 'agency' | 'status' | 'cause';
}

export async function generate(params: ReportParams): Promise<Blob> {
  const endpoint = params.format === 'csv' ? '/reports/export-csv' : '/reports/export-pdf';
  const response = await apiClient.get(endpoint, {
    params: {
      type: params.type === 'custom' ? 'all' : params.type,
      date_from: params.date_from,
      date_to: params.date_to,
    },
    responseType: 'blob',
  });

  return response as unknown as Blob;
}

export function getGenerateUrl(params: ReportParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      query.append(key, String(value));
    }
  });
  return getDownloadUrl(`/reports/export-pdf?${query.toString()}`);
}
