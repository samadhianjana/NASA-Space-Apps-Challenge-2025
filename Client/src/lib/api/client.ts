import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Request failed';
    return Promise.reject(new Error(msg));
  }
);
