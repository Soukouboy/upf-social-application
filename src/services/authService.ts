/**
 * Service d'authentification
 *
 * Communique avec les endpoints :
 *   POST /auth/register — inscription
 *   POST /auth/login    — connexion
 *   POST /auth/refresh  — renouvellement du token
 *   POST /auth/logout   — déconnexion
 */
import api from './api';
import type { AuthTokens, LoginRequest, RegisterRequest, Student } from '../types';

/** Connexion — retourne les tokens JWT */
export const login = async (credentials: LoginRequest): Promise<AuthTokens> => {
  const { data } = await api.post<AuthTokens>('/auth/login', credentials);
  return data;
};

/** Inscription — retourne les tokens JWT */
export const register = async (payload: RegisterRequest): Promise<AuthTokens> => {
  const { data } = await api.post<AuthTokens>('/auth/register', payload);
  return data;
};

/** Rafraîchir le token d'accès */
export const refreshToken = async (refreshToken: string): Promise<AuthTokens> => {
  const { data } = await api.post<AuthTokens>('/auth/refresh', { refreshToken });
  return data;
};

/** Déconnexion côté serveur */
export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

/** Récupérer le profil de l'utilisateur connecté */
export const getCurrentUser = async (): Promise<Student> => {
  const { data } = await api.get<Student>('/users/me');
  return data;
};
