/**
 * Service Utilisateurs — Réseau social
 *
 * Note: Les endpoints de follow ont migré vers followService.ts
 * Les endpoints /users/{id}/follow n'existent plus → utiliser /follows/{followedId}
 */
import api from './api';
import type { StudentNetwork, PaginatedResponse, StudentProfileFrontend } from '../types';
import { followUser as _followUser, unfollowUser as _unfollowUser } from './followService';

/**
 * Recherche globale des étudiants pour la page Réseau
 * Note: Endpoint à confirmer côté backend — /users ou /students
 */
export const getUsers = async (search?: string): Promise<PaginatedResponse<StudentNetwork>> => {

  const { data } = await api.get<PaginatedResponse<StudentNetwork>>('/users', {

  });
  return data;
};

/**
 * Récupérer le profil d'un utilisateur par son ID
 * Utile pour enrichir les conversations privées (DirectMessagesPage)
 */
export const getUserProfile = async (userId: string): Promise<StudentProfileFrontend> => {
  const { data } = await api.get<StudentProfileFrontend>(`/users/${userId}/profile`);
  return data;
};

/**
 * Suivre un utilisateur
 * @deprecated Utiliser followService.followUser() — endpoint /follows/{followedId}
 */
export const followUser = async (userId: string): Promise<void> => {
  return _followUser(userId);
};

/**
 * Se désabonner d'un utilisateur
 * @deprecated Utiliser followService.unfollowUser() — endpoint /follows/{followedId}
 */
export const unfollowUser = async (userId: string): Promise<void> => {
  return _unfollowUser(userId);
};
