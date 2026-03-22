/**
 * GroupChatPage — Chat temps réel d'un groupe via WebSocket/STOMP
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, IconButton, useTheme, alpha, Paper,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CircleIcon from '@mui/icons-material/Circle';
import UPFAvatar from '../../components/ui/UPFAvatar';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import { getMessages } from '../../services/chatService';
import type { Message } from '../../types';

const GroupChatPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const groupId = id ? Number(id) : null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger l'historique
  useEffect(() => {
    const loadHistory = async () => {
      if (!groupId) return;
      try {
        const result = await getMessages(groupId, 0, 50);
        setMessages(result.content.reverse());
      } catch {
        // Messages mock pour la démo
        setMessages([
          { id: 1, groupId: groupId, sender: { id: 1, firstName: 'Amina', lastName: 'B.', avatarUrl: undefined }, content: 'Salut tout le monde ! Qui a commencé le TP 3 ?', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { id: 2, groupId: groupId, sender: { id: 2, firstName: 'Youssef', lastName: 'K.', avatarUrl: undefined }, content: 'Oui, j\'ai fini la question 1 et 2. La 3 est compliquée 😅', timestamp: new Date(Date.now() - 3000000).toISOString() },
          { id: 3, groupId: groupId, sender: { id: 3, firstName: 'Sara', lastName: 'M.', avatarUrl: undefined }, content: 'Je peux partager mes notes du cours si ça aide. Envoyez-moi un DM.', timestamp: new Date(Date.now() - 1800000).toISOString() },
          { id: 4, groupId: groupId, sender: { id: 1, firstName: 'Amina', lastName: 'B.', avatarUrl: undefined }, content: 'Ce serait super Sara ! Merci 🙏', timestamp: new Date(Date.now() - 1200000).toISOString() },
        ]);
      }
    };
    loadHistory();
  }, [groupId]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Callback pour les messages reçus
  const onMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const onConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
  }, []);

  const { sendMessage } = useWebSocket({
    groupId,
    onMessage,
    onConnectionChange,
  });

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    // Ajouter le message localement en attendant le broadcast
    if (user) {
      const localMsg: Message = {
        id: Date.now(),
        groupId: groupId!,
        sender: { id: user.id, firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl },
        content: input.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, localMsg]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

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
        <IconButton onClick={() => navigate(`/groups/${id}`)}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600}>Chat du groupe</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CircleIcon sx={{ fontSize: 8, color: isConnected ? 'success.main' : 'text.secondary' }} />
            <Typography variant="caption" color={isConnected ? 'success.main' : 'text.secondary'}>
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Zone des messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {messages.map((msg) => {
          const isOwn = msg.sender.id === user?.id;
          return (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                gap: 1,
              }}
            >
              {!isOwn && (
                <UPFAvatar firstName={msg.sender.firstName} lastName={msg.sender.lastName} size="small" />
              )}
              <Box sx={{ maxWidth: '70%' }}>
                {!isOwn && (
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ ml: 1.5 }}>
                    {msg.sender.firstName} {msg.sender.lastName}
                  </Typography>
                )}
                <Box
                  sx={{
                    py: 1.2,
                    px: 2,
                    borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    bgcolor: isOwn
                      ? theme.palette.primary.main
                      : '#fff',
                    color: isOwn ? '#fff' : theme.palette.text.primary,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                    {msg.content}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.3, textAlign: isOwn ? 'right' : 'left', mx: 1.5, fontSize: '0.65rem' }}
                >
                  {formatTime(msg.timestamp)}
                </Typography>
              </Box>
            </Box>
          );
        })}
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
          fullWidth
          size="small"
          multiline
          maxRows={3}
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
            bgcolor: theme.palette.primary.main,
            color: '#fff',
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
