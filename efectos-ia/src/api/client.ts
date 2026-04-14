import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (import.meta.env.DEV) {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.detail ??
      err.response?.data?.message ??
      err.message ??
      'Error de red desconocido';
    return Promise.reject(new Error(msg));
  }
);
