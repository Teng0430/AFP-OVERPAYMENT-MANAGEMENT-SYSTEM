import apiClient, { uploadFile } from './api';
import type { UploadBatch } from '../types';

export interface UploadPreview {
  columns: string[];
  rows: Record<string, unknown>[];
  errors: Record<string, unknown>[];
  duplicates: Record<string, unknown>[];
}

export async function upload(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<{ upload_batch: UploadBatch }> {
  const data = await uploadFile<{ upload_batch: UploadBatch }>(
    '/uploads',
    file,
    onProgress,
  );
  return data;
}

export async function preview(batchId: number): Promise<UploadPreview> {
  const data = await apiClient.get('/uploads/preview', {
    params: { upload_batch_id: batchId },
  }) as UploadPreview;
  return data;
}

export async function confirm(batchId: number): Promise<UploadBatch> {
  const data = await apiClient.post(`/uploads/${batchId}/confirm`) as { upload_batch: UploadBatch };
  return data.upload_batch;
}

export async function history(): Promise<{ uploads: UploadBatch[] }> {
  const data = await apiClient.get('/uploads') as { uploads: UploadBatch[] };
  return data;
}

export async function get(id: number): Promise<UploadBatch> {
  const data = await apiClient.get(`/uploads/${id}`) as { upload_batch: UploadBatch };
  return data.upload_batch;
}
