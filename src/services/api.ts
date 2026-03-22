/**
 * Instance Axios centralisée
 *
 * - Ajoute automatiquement le token JWT dans l'en-tête Authorization.
 * - Gère le rafraîchissement automatique du token en cas de 401.
 * - Redirige vers /login si le refresh échoue.
 */
import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';
import type { AuthTokens } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ────────── Gestion du token ──────────

const TOKEN_KEY = 'upf_tokens';

export const getStoredTokens = (): AuthTokens | null => {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
};

export const storeTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

export const removeTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// ────────── Intercepteur requête : ajout du Bearer token ──────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = getStoredTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ────────── Intercepteur réponse : refresh automatique sur 401 ──────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si 401 et pas déjà en retry → tenter un refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // File d'attente pendant le refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = getStoredTokens();
        if (!tokens?.refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post<AuthTokens>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: tokens.refreshToken }
        );

        storeTokens(data);
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
