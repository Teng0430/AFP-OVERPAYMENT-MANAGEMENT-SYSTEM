import axios, { type AxiosResponse, type AxiosProgressEvent } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data?.success === true) {
      return response.data.data;
    }
    return Promise.reject(new Error(response.data?.error ?? 'Request failed'));
  },
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Unable to connect. Please check your internet connection and try again.'));
    }
    const status = error.response.status;
    if (status === 401) {
      return Promise.reject(new Error('Invalid username or password.'));
    }
    if (status === 403 || status === 423) {
      return Promise.reject(new Error('Account locked. Please contact your administrator.'));
    }
    if (status >= 500) {
      return Promise.reject(new Error('Service temporarily unavailable. Please try again later.'));
    }
    if (status === 422) {
      const errorData = error.response.data?.error;
      const message = typeof errorData === 'object' && errorData !== null
        ? (errorData as { message?: string }).message ?? 'Validation failed.'
        : errorData ?? 'Validation failed.';
      const err = new Error(message);
      (err as Record<string, unknown>).validationErrors = typeof errorData === 'object' && errorData !== null
        ? (errorData as { details?: Record<string, string[]> }).details ?? {}
        : {};
      return Promise.reject(err);
    }
    return Promise.reject(new Error(error.response.data?.error ?? 'An unexpected error occurred. Please try again.'));
  },
);

export function getDownloadUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
  const token = localStorage.getItem('auth_token');
  return `${base}${path}${path.includes('?') ? '&' : '?'}token=${token}`;
}

export async function uploadFile<T>(
  url: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  }) as T;

  return response;
}

export default apiClient;
