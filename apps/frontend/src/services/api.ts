import axios from 'axios';

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
  (response) => {
    if (response.data?.success === true) {
      return response.data.data;
    }
    return Promise.reject(new Error(response.data?.error ?? 'Request failed'));
  },
  (error) => {
    const message = error.response?.data?.error ?? error.message;
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
