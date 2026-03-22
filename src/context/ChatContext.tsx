/**
 * Contexte de chat
 *
 * Gère l'état du chat actif :
 *   - groupe actuellement sélectionné
 *   - liste des messages chargés
 *   - statut de connexion WebSocket
 */
import React, { createContext, useState, useCallback, type ReactNode } from 'react';
import type { Message } from '../types';

interface ChatContextValue {
  /** ID du groupe dont le chat est ouvert */
  activeGroupId: number | null;
  /** Messages du chat actif */
  messages: Message[];
  /** Statut de connexion WebSocket */
  isConnected: boolean;
  /** Sélectionner un groupe pour le chat */
  setActiveGroup: (groupId: number | null) => void;
  /** Remplacer la liste des messages (chargement initial/historique) */
  setMessages: (messages: Message[]) => void;
  /** Ajouter un message reçu en temps réel */
  addMessage: (message: Message) => void;
  /** Préfixer des messages (historique plus ancien — scroll infini) */
  prependMessages: (messages: Message[]) => void;
  /** Mettre à jour le statut de connexion */
  setConnected: (connected: boolean) => void;
}

export const ChatContext = createContext<ChatContextValue>({
  activeGroupId: null,
  messages: [],
  isConnected: false,
  setActiveGroup: () => {},
  setMessages: () => {},
  addMessage: () => {},
  prependMessages: () => {},
  setConnected: () => {},
});

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [messages, setMessagesState] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const setActiveGroup = useCallback((groupId: number | null) => {
    setActiveGroupId(groupId);
    setMessagesState([]); // Réinitialiser les messages lors du changement de groupe
  }, []);

  const setMessages = useCallback((msgs: Message[]) => {
    setMessagesState(msgs);
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessagesState((prev) => [...prev, message]);
  }, []);

  const prependMessages = useCallback((msgs: Message[]) => {
    setMessagesState((prev) => [...msgs, ...prev]);
  }, []);

  const setConnected = useCallback((connected: boolean) => {
    setIsConnected(connected);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        activeGroupId,
        messages,
        isConnected,
        setActiveGroup,
        setMessages,
        addMessage,
        prependMessages,
        setConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
