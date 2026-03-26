/**
 * AttendX — Axios API Instance
 * Base URL = FastAPI backend. Attaches Firebase ID token to every request.
 */
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { getIdToken } from './firebase';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Firebase ID token
api.interceptors.request.use(
  async (config) => {
    const token = await getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    if (status === 401) {
      // Token expired or invalid — will be handled by auth state listener
      console.warn('Auth token invalid or expired');
    }

    if (status === 403 && detail?.code === 'account_inactive') {
      // Account pending or disabled — handled by ProtectedRoute
      console.warn('Account inactive:', detail.status);
    }

    return Promise.reject(error);
  }
);

export default api;
