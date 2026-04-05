/**
 * Service de messagerie privée (DM)
 *
 * Endpoints attendus côté backend :
 *   GET  /messages/conversations              — liste des conversations privées
 *   GET  /messages/direct/:userId?page&size   — historique des messages avec un utilisateur
 *   POST /messages/direct/:userId             — envoyer un message privé
 */
import api from './api';
import type { ConversationLegacy, DirectMessage, PaginatedResponse } from '../types';

/** Liste des conversations privées */
export const getConversations = async (): Promise<ConversationLegacy[]> => {
  const { data } = await api.get<ConversationLegacy[]>('/messages/conversations');
  return data;
};

/** Historique des messages avec un utilisateur */
export const getDirectMessages = async (
  userId: number | string,
  page: number = 0,
  size: number = 30
): Promise<PaginatedResponse<DirectMessage>> => {
  const { data } = await api.get<PaginatedResponse<DirectMessage>>(`/messages/direct/${userId}`, {
    params: { page, size },
  });
  return data;
};

/** Envoyer un message privé */
export const sendDirectMessage = async (
  userId: number | string,
  content: string
): Promise<DirectMessage> => {
  const { data } = await api.post<DirectMessage>(`/messages/direct/${userId}`, { content });
  return data;
};
