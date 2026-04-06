/**
 * Service Follow — Réseau social (abonnements)
 *
 * Endpoints réels (backend ENDPIN.md) :
 *   POST   /follows/{followedId}              — suivre un utilisateur (201)
 *   DELETE /follows/{followedId}              — se désabonner (204)
 *   GET    /follows/me/followers              — mes followers
 *   GET    /follows/me/following              — ceux que je suis
 *   GET    /follows/{studentId}/followers     — followers d'un étudiant
 *   GET    /follows/{followedId}/status       — est-ce que je suis cet utilisateur? (boolean)
 */
import api from './api';
import type { StudentFollow, StudentNetwork, StudentProfileFrontend } from '../types';

/** Suivre un utilisateur (retourne 201 Created) */
export const followUser = async (followedId: string): Promise<void> => {
  await api.post(`/follows/${followedId}`);
};

/** Se désabonner d'un utilisateur (retourne 204 No Content) */
export const unfollowUser = async (followedId: string): Promise<void> => {
  await api.delete(`/follows/${followedId}`);
};

/** Récupérer mes followers */
export const getMyFollowers = async (): Promise<StudentNetwork[]> => {
  const { data } = await api.get<StudentNetwork[]>('/follows/me/followers');
  return Array.isArray(data) ? data : [];
};

/** Récupérer les utilisateurs que je suis */
export const getMyFollowing = async (): Promise<StudentProfileFrontend[]> => {
  const { data } = await api.get<StudentProfileFrontend[]>('/follows/me/following');
  return Array.isArray(data) ? data : [];
};

/** Récupérer les followers d'un étudiant spécifique */
export const getStudentFollowers = async (studentId: string): Promise<StudentProfileFrontend[]> => {
  const { data } = await api.get<StudentProfileFrontend[]>(`/follows/${studentId}/followers`);
  return Array.isArray(data) ? data : [];
};

/** Vérifier si l'utilisateur connecté suit un profil spécifique */
export const checkFollowStatus = async (followedId: string): Promise<boolean> => {
  const { data } = await api.get<boolean>(`/follows/${followedId}/status`);
  return Boolean(data);
};
