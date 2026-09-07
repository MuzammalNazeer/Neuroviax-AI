import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Inject Access Token and Business Context Header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Read from Zustand store first, fallback to localStorage
    const token =
      useAuthStore.getState().accessToken || localStorage.getItem('accessToken');
    const businessId =
      useAuthStore.getState().businessId || localStorage.getItem('businessId');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (businessId) {
      config.headers['x-business-id'] = businessId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Token Refresh Mutex / Concurrency Queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: Secure 401 recovery via Refresh Token rotation
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If request has no config or is already retrying or is an auth endpoint, reject
    if (
      !originalRequest ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/register')
    ) {
      return Promise.reject(error);
    }

    // Handle unauthorized (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken =
        useAuthStore.getState().refreshToken || localStorage.getItem('refreshToken');

      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      // If already refreshing, enqueue concurrent requests
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.accessToken;
        useAuthStore.getState().setTokens(newAccessToken);

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
