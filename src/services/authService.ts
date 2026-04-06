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
import type { AuthTokens, LoginRequest, RegisterStudentRequest, StudentDetails, CurrentUserResponse, AuthUser } from '../types';

/** Connexion — retourne les tokens JWT */
export const login = async (credentials: LoginRequest): Promise<AuthTokens> => {
  const { data } = await api.post<AuthTokens>('/auth/login', credentials);
  return data;
};

/** Inscription — retourne les tokens JWT */
export const register = async (payload: RegisterStudentRequest): Promise<StudentDetails> => {
  const { data } = await api.post<StudentDetails>('/auth/register', payload);
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
export const getCurrentUser = async (): Promise<AuthUser> => {
  const { data } = await api.get<CurrentUserResponse>('/users/me');
  
  // Mappage de la réponse Backend vers notre interface unifiée (AuthUser)
  if (data.role === 'STUDENT' && data.studentProfile) {
    return {
      id: data.studentProfile.id,
      userId: data.studentProfile.userId,
      role: data.role,
      email: data.studentProfile.email,
      firstName: data.studentProfile.firstName,
      lastName: data.studentProfile.lastName,
      avatarUrl: data.studentProfile.profilePictureUrl || undefined,
      profileData: data,
    };
  } else if (data.role === 'ADMIN' && data.adminProfile) {
    return {
      id: data.adminProfile.id,
      userId: data.adminProfile.userId,
      role: data.role,
      email: data.adminProfile.email,
      firstName: data.adminProfile.firstName,
      lastName: data.adminProfile.lastName,
      profileData: data,
    };
  } else if (data.role === 'PROFESSOR' && data.professorProfile) {
    return {
      id: data.professorProfile.id,
      userId: data.professorProfile.userId,
      role: data.role,
      email: data.professorProfile.email,
      firstName: data.professorProfile.firstName,
      lastName: data.professorProfile.lastName,
      profileData: data,
    };
  }

  throw new Error("Format de réponse de l'utilisateur invalide");
};
