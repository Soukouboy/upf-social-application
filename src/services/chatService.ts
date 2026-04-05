/**
 * Service de messagerie (chat de groupe)
 *
 * Fallback REST :
 *   GET /messages?groupId=X&page=Y — historique paginé
 *
 * Le temps réel se fait via le hook useWebSocket.
 */
import api from './api';
import type { Message, PaginatedResponse } from '../types';

/** Récupérer l'historique des messages d'un groupe (REST fallback) */
export const getMessages = async (
  groupId: number | string,
  page: number = 0,
  size: number = 30
): Promise<PaginatedResponse<Message>> => {
  const { data } = await api.get<PaginatedResponse<Message>>('/messages', {
    params: { groupId, page, size },
  });
  return data;
};
