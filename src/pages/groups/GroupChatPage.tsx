/**
 * GroupChatPage — Chat temps réel d'un groupe via WebSocket/STOMP
 *
 * Endpoints utilisés :
 *   GET REST : /messages/groups/{groupId} (historique, ChatMessageResponse)
 *   WebSocket : /app/chat/group/{groupId} (envoi, payload: { content })
 *   Abonnement : /topic/group/{groupId} (réception)
 *
 * Note : Le groupId dans le payload WebSocket est retiré (il est dans l'URL)
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, IconButton, useTheme, alpha, Paper, Skeleton,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CircleIcon from '@mui/icons-material/Circle';
import UPFAvatar from '../../components/ui/UPFAvatar';
import { useAuth } from '../../hooks/useAuth';
import { getGroupMessages, sendGroupMessage } from '../../services/messageService';
import type { ChatMessageResponse } from '../../types';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

const GroupChatPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);

  // Charger l'historique des messages du groupe
  useEffect(() => {
    if (!id) return;
    const loadHistory = async () => {
      setLoading(true);
      try {
        const result = await getGroupMessages(id, 0, 50);
        setMessages(result.content);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [id]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connexion WebSocket STOMP
  useEffect(() => {
    if (!id) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      onConnect: () => {
        setIsConnected(true);
        // Abonnement au topic du groupe
        client.subscribe(`/topic/group/${id}`, (frame) => {
          try {
            const msg: ChatMessageResponse = JSON.parse(frame.body);
            setMessages((prev) => {
              // Éviter les doublons (message envoyé optimistement)
              const isDuplicate = prev.some(
                (m) => m.messageId === msg.messageId && !m.messageId?.startsWith('local-')
              );
              if (isDuplicate) {
                // Remplacer le message local par le message serveur
                return prev.map((m) =>
                  m.messageId?.startsWith('local-') && m.content === msg.content && m.senderId === msg.senderId
                    ? msg
                    : m
                );
              }
              return [...prev, msg];
            });
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
  }, [id]);

  const handleSend = async () => {
    if (!input.trim() || !id) return;
    const content = input.trim();
    setInput('');

    try {
      // Envoi garanti via l'API REST
      const sent = await sendGroupMessage(id, content);
      setMessages((prev) => {
        if (prev.some((m) => m.messageId === sent.messageId)) return prev;
        return [...prev, sent];
      });
    } catch (error) {
      console.error('Erreur lors de lenvoi du message groupe', error);
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
      {/* Header du chat */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          p: 2, borderRadius: 3, mb: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <IconButton onClick={() => navigate(`/student/groups/${id}`)}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600}>Chat du groupe</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CircleIcon sx={{ fontSize: 8, color: isConnected ? 'success.main' : 'text.secondary' }} />
            <Typography variant="caption" color={isConnected ? 'success.main' : 'text.secondary'}>
              {isConnected ? 'Connecté (temps réel)' : 'Déconnecté'}
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
              <Skeleton variant="rounded" width="55%" height={40} sx={{ borderRadius: 2 }} />
            </Box>
          ))
        ) : messages.length === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              Aucun message. Lancez la discussion !
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            const isOwn = isOwnMessage(msg);
            const firstName = msg.senderName?.split(' ')[0] ?? '?';
            const lastName = msg.senderName?.split(' ').slice(1).join(' ') ?? '';
            return (
              <Box
                key={msg.messageId ?? msg.id}
                sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', gap: 1 }}
              >
                {!isOwn && <UPFAvatar firstName={firstName} lastName={lastName} size="small" />}
                <Box sx={{ maxWidth: '70%' }}>
                  {!isOwn && (
                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ ml: 1.5 }}>
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
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {msg.content}
                    </Typography>
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

export default GroupChatPage;
