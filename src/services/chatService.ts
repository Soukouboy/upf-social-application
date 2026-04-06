/**
 * Service Chat (fallback REST pour GroupChatPage)
 *
 * Endpoint réel (backend ENDPIN.md) :
 *   GET /messages/groups/{groupId} — historique paginé des messages de groupe
 *
 * Le temps réel se fait via useWebSocket (STOMP/SockJS).
 */
import api from './api';
import type { ChatMessageResponse, PaginatedResponse } from '../types';

/** Récupérer l'historique des messages d'un groupe (REST fallback) */
export const getGroupMessages = async (
  groupId: string,
  page: number = 0,
  size: number = 50
): Promise<PaginatedResponse<ChatMessageResponse>> => {
  const { data } = await api.get<PaginatedResponse<ChatMessageResponse>>(
    `/messages/groups/${groupId}`,
    { params: { page, size, sort: 'sentAt,asc' } }
  );
  return data;
};

// Alias pour la compatibilité avec l'ancienne signature
export const getMessages = getGroupMessages;
