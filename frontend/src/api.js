import axios from 'axios';

const isDev = import.meta.env.DEV;
const backendPort = import.meta.env.VITE_BACKEND_PORT || '3001';
const baseURL = isDev ? `http://localhost:${backendPort}/api/v1` : '/api/v1';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
