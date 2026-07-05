import apiClient from './api';
import type { RecoveryInstallment, InstallmentSummary } from '../types';

export interface InstallmentsResponse {
  installments: RecoveryInstallment[];
  summary: InstallmentSummary;
}

export async function getInstallments(pensionerId: number): Promise<InstallmentsResponse> {
  const data = await apiClient.get(`/pensioners/${pensionerId}/installments`) as InstallmentsResponse;
  return data;
}

export async function addInstallment(
  pensionerId: number,
  payload: {
    date_paid: string;
    amount_paid: number;
    collector?: string;
    remarks?: string;
  },
): Promise<RecoveryInstallment> {
  const data = await apiClient.post(
    `/pensioners/${pensionerId}/installments`,
    payload,
  ) as { installment: RecoveryInstallment };
  return data.installment;
}

export function exportPdfUrl(pensionerId: number): string {
  return `/pensioners/${pensionerId}/installments/export-pdf`;
}
