import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

const api = axios.create({
  baseURL: API_BASE,
  // withCredentials sends the HTTP-only access_token cookie automatically.
  // The backend's InjectTokenFromCookie middleware promotes it to a Bearer
  // header before Sanctum processes the request.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Response interceptor — handle 401 (session expired / cookie cleared)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const wasAuthenticated = useAuthStore.getState().isAuthenticated;
      // Clear stale local state
      useAuthStore.getState().logout();
      // Only redirect to login if the user HAD an active session.
      // This prevents the bootstrap /auth/me call from redirecting guests.
      if (wasAuthenticated) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const GOOGLE_AUTH_URL = `${API_BASE}/auth/google/redirect`;

export default api;
