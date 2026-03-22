import api from './api';
import type { StudentNetwork, PaginatedResponse } from '../types';

/**
 * Récupère la liste globale des étudiants pour le réseau
 */
export const getUsers = async (search?: string): Promise<PaginatedResponse<StudentNetwork>> => {
  const { data } = await api.get<PaginatedResponse<StudentNetwork>>('/users', {
    params: { search },
  });
  return data;
};

/**
 * S'abonne (suit) un étudiant
 */
export const followUser = async (userId: number): Promise<void> => {
  await api.post(`/users/${userId}/follow`);
};

/**
 * Se désabonne d'un étudiant
 */
export const unfollowUser = async (userId: number): Promise<void> => {
  await api.delete(`/users/${userId}/follow`);
};
