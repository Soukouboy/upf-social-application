/**
 * DirectChatPage — Conversation privée 1-to-1
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, IconButton, Paper, useTheme, alpha,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CircleIcon from '@mui/icons-material/Circle';
import UPFAvatar from '../../components/ui/UPFAvatar';
import { useAuth } from '../../hooks/useAuth';
import type { DirectMessage } from '../../types';
import { getDirectMessages, sendDirectMessage } from '../../services/messageService';

const MOCK_CONTACT = { firstName: 'Sarah', lastName: 'Alaoui', isOnline: true };

const DirectChatPage: React.FC = () => {
  const theme = useTheme();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const targetId = userId ? Number(userId) : null;

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!targetId) return;
      try {
        const result = await getDirectMessages(targetId, 0, 50);
        setMessages(result.content.reverse());
      } catch {
        // Mock messages for demo
        setMessages([
          { id: 1, senderId: targetId, receiverId: user?.id || 1, senderName: `${MOCK_CONTACT.firstName} ${MOCK_CONTACT.lastName}`, content: 'Salut ! Tu as les notes du cours de ce matin ?', read: true, timestamp: new Date(Date.now() - 3600000).toISOString() },
          { id: 2, senderId: user?.id || 1, receiverId: targetId, senderName: 'Moi', content: 'Oui, je te les envoie tout de suite 📄', read: true, timestamp: new Date(Date.now() - 3000000).toISOString() },
          { id: 3, senderId: targetId, receiverId: user?.id || 1, senderName: `${MOCK_CONTACT.firstName} ${MOCK_CONTACT.lastName}`, content: 'Merci beaucoup ! Tu gères 🙌', read: true, timestamp: new Date(Date.now() - 2400000).toISOString() },
          { id: 4, senderId: user?.id || 1, receiverId: targetId, senderName: 'Moi', content: 'De rien ! On se retrouve à la biblio demain ?', read: true, timestamp: new Date(Date.now() - 1800000).toISOString() },
          { id: 5, senderId: targetId, receiverId: user?.id || 1, senderName: `${MOCK_CONTACT.firstName} ${MOCK_CONTACT.lastName}`, content: 'Parfait, à 10h comme d\'habitude 👍', read: false, timestamp: new Date(Date.now() - 300000).toISOString() },
        ]);
      }
    };
    loadMessages();
  }, [targetId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !targetId) return;
    const content = input.trim();
    setInput('');

    // Optimistic update
    const localMsg: DirectMessage = {
      id: Date.now(),
      senderId: user?.id || 1,
      receiverId: targetId,
      senderName: 'Moi',
      content,
      read: false,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, localMsg]);

    try {
      await sendDirectMessage(targetId, content);
    } catch {
      // Message already added optimistically
    }
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
        <UPFAvatar firstName={MOCK_CONTACT.firstName} lastName={MOCK_CONTACT.lastName} online={MOCK_CONTACT.isOnline} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {MOCK_CONTACT.firstName} {MOCK_CONTACT.lastName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CircleIcon sx={{ fontSize: 8, color: MOCK_CONTACT.isOnline ? 'success.main' : 'text.secondary' }} />
            <Typography variant="caption" color={MOCK_CONTACT.isOnline ? 'success.main' : 'text.secondary'}>
              {MOCK_CONTACT.isOnline ? 'En ligne' : 'Hors ligne'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flex: 1, overflow: 'auto', p: 2, borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex', flexDirection: 'column', gap: 1.5,
        }}
      >
        {messages.map((msg) => {
          const isOwn = msg.senderId === (user?.id || 1);
          return (
            <Box key={msg.id} sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', gap: 1 }}>
              {!isOwn && (
                <UPFAvatar firstName={MOCK_CONTACT.firstName} lastName={MOCK_CONTACT.lastName} size="small" />
              )}
              <Box sx={{ maxWidth: '70%' }}>
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
                  {formatTime(msg.timestamp)}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
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
