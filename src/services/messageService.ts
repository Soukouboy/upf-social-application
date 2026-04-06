/**
 * Service de messagerie (groupe + privé)
 *
 * Endpoints réels (backend ENDPIN.md) :
 *   POST /messages/groups/{groupId}       — envoyer msg groupe
 *   GET  /messages/groups/{groupId}       — historique paginé groupe
 *   POST /messages/private                — envoyer message privé (param: recipientId, content)
 *   GET  /messages/private                — liste paginée des conversations
 *   GET  /messages/private/{otherUserId}  — historique paginé avec un utilisateur
 */
import api from './api';
import type { ChatMessageResponse, PrivateConversationSummaryResponse, PaginatedResponse } from '../types';

// ─── Messages de Groupe ─────────────────────────────────────────────────────

/** Récupérer l'historique des messages d'un groupe (REST fallback) */
export const getGroupMessages = async (
  groupId: string,
  page: number = 0,
  size: number = 50
): Promise<PaginatedResponse<ChatMessageResponse>> => {
  const { data } = await api.get<PaginatedResponse<ChatMessageResponse>>(
    `/messages/groups/${groupId}`,
    { params: { page, size, sort: 'createdAt,asc' } }
  );
  return data;
};

/** Envoyer un message dans un groupe (REST fallback si WebSocket indisponible) */
export const sendGroupMessage = async (
  groupId: string,
  content: string
): Promise<ChatMessageResponse> => {
  const { data } = await api.post<ChatMessageResponse>(
    `/messages/groups/${groupId}`,
    { content }
  );
  return data;
};

// ─── Messages Privés ────────────────────────────────────────────────────────

/** Liste paginée des conversations privées */
export const getPrivateConversations = async (
  page: number = 0,
  size: number = 30
): Promise<PaginatedResponse<PrivateConversationSummaryResponse>> => {
  const { data } = await api.get<PaginatedResponse<PrivateConversationSummaryResponse>>(
    '/messages/private',
    { params: { page, size } }
  );
  return data;
};

/** Historique des messages privés avec un utilisateur */
export const getPrivateMessages = async (
  otherUserId: string,
  page: number = 0,
  size: number = 50
): Promise<PaginatedResponse<ChatMessageResponse>> => {
  const { data } = await api.get<PaginatedResponse<ChatMessageResponse>>(
    `/messages/private/${otherUserId}`,
    { params: { page, size } }
  );
  return data;
};

/** Envoyer un message privé */
export const sendPrivateMessage = async (
  recipientId: string,
  content: string
): Promise<ChatMessageResponse> => {
  const { data } = await api.post<ChatMessageResponse>(
    '/messages/private',
    { recipientId, content }
  );
  return data;
};

// ─── Alias de compatibilité (utilisés par les anciennes pages) ───────────────

/** @deprecated Utiliser getPrivateConversations() */
export const getConversations = getPrivateConversations;

/** @deprecated Utiliser getPrivateMessages() */
export const getDirectMessages = (userId: string, page = 0, size = 30) =>
  getPrivateMessages(userId, page, size);

/** @deprecated Utiliser sendPrivateMessage() */
export const sendDirectMessage = (userId: string, content: string) =>
  sendPrivateMessage(userId, content);
