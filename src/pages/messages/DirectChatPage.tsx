/**
 * DirectChatPage — Conversation privée 1-to-1
 *
 * Utilise :
 *   GET  /messages/private/{otherUserId} → historique paginé de ChatMessageResponse
 *   POST /messages/private               → envoyer un message (param: recipientId, content)
 *   WebSocket /app/chat/private/{recipientId} → temps réel (destination: /user/{email}/queue/messages)
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, IconButton, Paper, useTheme, alpha, Skeleton,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CircleIcon from '@mui/icons-material/Circle';
import UPFAvatar from '../../components/ui/UPFAvatar';
import { useAuth } from '../../hooks/useAuth';
import type { ChatMessageResponse, StudentProfileFrontend } from '../../types';
import { getPrivateMessages, sendPrivateMessage } from '../../services/messageService';
import { getUserProfile } from '../../services/userService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

const DirectChatPage: React.FC = () => {
  const theme = useTheme();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [otherUser, setOtherUser] = useState<StudentProfileFrontend | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);

  // Charger l'historique des messages et le profil
  useEffect(() => {
    if (!userId) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [result, profile] = await Promise.all([
          getPrivateMessages(userId, 0, 50),
          getUserProfile(userId).catch(() => null)
        ]);
        // Les messages arrivent triés par sentAt,asc → pas besoin de reverse()
        setMessages(result.content);
        if (profile) setOtherUser(profile);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  // Connexion WebSocket pour les messages privés en temps réel
  useEffect(() => {
    if (!userId || !user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      onConnect: () => {
        setIsConnected(true);
        // Abonnement aux messages privés entrants
        client.subscribe(`/user/queue/messages`, (frame) => {
          try {
            const msg: ChatMessageResponse = JSON.parse(frame.body);
            // Filtrer pour n'afficher que les messages de cette conversation
            if (msg.senderId === userId || msg.recipientId === userId) {
              setMessages((prev) => {
                // Éviter les doublons si le REST a déjà inséré le message
                if (prev.some((m) => m.messageId === msg.messageId)) return prev;
                return [...prev, msg];
              });
            }
          } catch { /* ignore */ }
        });
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: () => setIsConnected(false),
      reconnectDelay: 5000,
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [userId, user]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !userId) return;
    const content = input.trim();
    setInput('');

    // Toujours utiliser l'API REST pour envoyer (correspond au ChatController @PostMapping)
    try {
      const sent = await sendPrivateMessage(userId, content);
      setMessages((prev) => {
        if (prev.some((m) => m.messageId === sent.messageId)) return prev;
        return [...prev, sent];
      });
    } catch (error) {
      console.error('Erreur lors de lanvoi du message privé', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const isOwnMessage = (msg: ChatMessageResponse) =>
    msg.senderId === user?.id || msg.senderId === user?.userId;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          p: 2, borderRadius: 3, mb: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <IconButton onClick={() => navigate('/student/messages')}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <UPFAvatar firstName={otherUser?.firstName || "?"} lastName={otherUser?.lastName || ""} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {otherUser ? `Conversation avec ${otherUser.firstName} ${otherUser.lastName}` : (userId ? `Conversation avec ${userId.substring(0, 8)}…` : 'Conversation privée')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CircleIcon sx={{ fontSize: 8, color: isConnected ? 'success.main' : 'text.secondary' }} />
            <Typography variant="caption" color={isConnected ? 'success.main' : 'text.secondary'}>
              {isConnected ? 'Connecté (temps réel)' : 'Mode REST'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Zone des messages */}
      <Box
        sx={{
          flex: 1, overflow: 'auto', p: 2, borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex', flexDirection: 'column', gap: 1.5,
        }}
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end' }}>
              <Skeleton variant="rounded" width="60%" height={40} sx={{ borderRadius: 2 }} />
            </Box>
          ))
        ) : messages.length === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              Aucun message. Commencez la conversation !
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            const isOwn = isOwnMessage(msg);
            return (
              <Box key={msg.messageId ?? msg.id} sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', gap: 1 }}>
                {!isOwn && (
                  <UPFAvatar firstName={msg.senderName?.split(' ')[0] ?? '?'} lastName={msg.senderName?.split(' ')[1] ?? ''} size="small" />
                )}
                <Box sx={{ maxWidth: '70%' }}>
                  {!isOwn && (
                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ ml: 1.5, display: 'block' }}>
                      {msg.senderName}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      py: 1.2, px: 2,
                      borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      bgcolor: isOwn ? theme.palette.primary.main : '#fff',
                      color: isOwn ? '#fff' : theme.palette.text.primary,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}
                  >
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{msg.content}</Typography>
                  </Box>
                  <Typography
                    variant="caption" color="text.secondary"
                    sx={{ display: 'block', mt: 0.3, textAlign: isOwn ? 'right' : 'left', mx: 1.5, fontSize: '0.65rem' }}
                  >
                    {formatTime(msg.sentAt ?? msg.createdAt ?? '')}
                    {msg.isEdited && ' · modifié'}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Zone de saisie */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          p: 1.5, mt: 2, borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message…"
          fullWidth size="small" multiline maxRows={3}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            },
          }}
        />
        <IconButton
          onClick={handleSend}
          disabled={!input.trim()}
          sx={{
            bgcolor: theme.palette.primary.main, color: '#fff',
            '&:hover': { bgcolor: theme.palette.primary.dark },
            '&.Mui-disabled': { bgcolor: theme.palette.divider, color: 'text.secondary' },
            width: 44, height: 44,
          }}
        >
          <SendRoundedIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default DirectChatPage;
