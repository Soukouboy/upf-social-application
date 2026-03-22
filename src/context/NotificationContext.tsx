/**
 * Contexte de notifications in-app
 *
 * Gère une liste de notifications (toasts) et un compteur de non-lues.
 * Peut être enrichi plus tard avec des notifications push / WebSocket.
 */
import React, { createContext, useState, useCallback, type ReactNode } from 'react';
import type { Notification } from '../types';

interface NotificationContextValue {
  /** Liste des notifications */
  notifications: Notification[];
  /** Nombre de notifications non lues */
  unreadCount: number;
  /** Ajouter une notification */
  addNotification: (notification: Notification) => void;
  /** Marquer une notification comme lue */
  markAsRead: (id: number) => void;
  /** Marquer toutes les notifications comme lues */
  markAllAsRead: () => void;
  /** Effacer toutes les notifications */
  clearAll: () => void;
}

export const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
