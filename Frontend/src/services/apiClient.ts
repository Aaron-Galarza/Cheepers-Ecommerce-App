// src/services/apiClient.ts

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: añade token si existe en localStorage (key: adminToken)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    // IMPORTANT: devolver config para que la request continúe
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;