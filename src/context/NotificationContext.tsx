/**
 * Contexte de notifications in-app
 *
 * Gère une liste de notifications et un compteur de non-lues.
 * Au montage : charge les annonces récentes des cours comme notifications.
 * WebSocket : s'abonne à /user/queue/notifications pour les notifs en temps réel.
 */
import React, { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { Notification } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
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

  // ── Connexion WebSocket pour les notifications temps réel ──────────────────
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        // Abonnement aux notifications personnelles
        client.subscribe('/user/queue/notifications', (frame) => {
          try {
            const raw = JSON.parse(frame.body);
            const notif: Notification = {
              id: raw.id ?? Date.now(),
              title: raw.title ?? raw.type ?? 'Nouvelle notification',
              message: raw.message ?? raw.content ?? '',
              read: false,
              type: raw.type ?? 'INFO',
              createdAt: raw.createdAt ?? new Date().toISOString(),
            };
            setNotifications((prev) => [notif, ...prev]);
          } catch { /* ignore */ }
        });

        // Abonnement aux nouvelles annonces de cours
        client.subscribe('/topic/announcements', (frame) => {
          try {
            const raw = JSON.parse(frame.body);
            const notif: Notification = {
              id: raw.id ?? Date.now(),
              title: `📢 ${raw.title ?? 'Nouvelle annonce'}`,
              message: raw.courseName ? `Cours : ${raw.courseName}` : '',
              read: false,
              type: 'ANNOUNCEMENT',
              createdAt: raw.createdAt ?? new Date().toISOString(),
            };
            setNotifications((prev) => [notif, ...prev]);
          } catch { /* ignore */ }
        });
      },
      reconnectDelay: 10000,
    });

    client.activate();
    return () => { client.deactivate(); };
  }, []);

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
