/**
 * Hook WebSocket/STOMP pour le chat temps réel
 *
 * Se connecte au broker STOMP du backend Spring Boot :
 *   - Endpoint WS : /ws (SockJS)
 *   - Envoi vers : /app/chat/{groupId}
 *   - Abonnement : /topic/group/{groupId}
 *
 * Le hook gère automatiquement la connexion/déconnexion
 * et l'abonnement au groupe actif.
 */
import { useEffect, useRef, useCallback } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getStoredTokens } from '../services/api';
import type { Message } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

interface UseWebSocketOptions {
  /** ID du groupe auquel s'abonner */
  groupId: number | null;
  /** Callback appelé à la réception d'un message */
  onMessage: (message: Message) => void;
  /** Callback de changement de statut de connexion */
  onConnectionChange?: (connected: boolean) => void;
}

export const useWebSocket = ({ groupId, onMessage, onConnectionChange }: UseWebSocketOptions) => {
  const clientRef = useRef<Client | null>(null);

  // Envoyer un message au groupe actif
  const sendMessage = useCallback(
    (content: string) => {
      if (!clientRef.current?.connected || !groupId) return;
      clientRef.current.publish({
        destination: `/app/chat/${groupId}`,
        body: JSON.stringify({ content }),
      });
    },
    [groupId]
  );

  useEffect(() => {
    if (!groupId) return;

    const tokens = getStoredTokens();

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${tokens?.accessToken || ''}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        onConnectionChange?.(true);
        // S'abonner aux messages du groupe
        client.subscribe(`/topic/group/${groupId}`, (frame: IMessage) => {
          try {
            const message: Message = JSON.parse(frame.body);
            onMessage(message);
          } catch {
            console.error('Erreur de parsing du message WebSocket');
          }
        });
      },

      onDisconnect: () => {
        onConnectionChange?.(false);
      },

      onStompError: (frame) => {
        console.error('Erreur STOMP :', frame.headers['message']);
        onConnectionChange?.(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [groupId, onMessage, onConnectionChange]);

  return { sendMessage };
};
