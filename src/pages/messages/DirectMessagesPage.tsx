/**
 * DirectMessagesPage — Liste des conversations privées (DM)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, List, ListItemButton, ListItemText,
  Skeleton, useTheme, alpha, Badge,
} from '@mui/material';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import UPFAvatar from '../../components/ui/UPFAvatar';
import EmptyState from '../../components/common/EmptyState';
import type { ConversationLegacy as Conversation } from '../../types';
import { getConversations } from '../../services/messageService';

const MOCK_CONVERSATIONS: Conversation[] = [
  { userId: 2, firstName: 'Sarah', lastName: 'Alaoui', lastMessage: 'Merci pour les notes !', lastMessageTime: new Date(Date.now() - 300000).toISOString(), unreadCount: 2, isOnline: true },
  { userId: 3, firstName: 'Youssef', lastName: 'Karimi', lastMessage: 'On se retrouve à la biblio à 14h ?', lastMessageTime: new Date(Date.now() - 3600000).toISOString(), unreadCount: 0, isOnline: true },
  { userId: 4, firstName: 'Lina', lastName: 'Tazi', lastMessage: 'Voici le PDF du cours.', lastMessageTime: new Date(Date.now() - 7200000).toISOString(), unreadCount: 1, isOnline: false },
  { userId: 5, firstName: 'Omar', lastName: 'Fassi', lastMessage: 'Super présentation hier ! 👏', lastMessageTime: new Date(Date.now() - 86400000).toISOString(), unreadCount: 0, isOnline: false },
  { userId: 6, firstName: 'Kenza', lastName: 'Moussaoui', lastMessage: 'Tu as fini le TP 4 ?', lastMessageTime: new Date(Date.now() - 172800000).toISOString(), unreadCount: 0, isOnline: true },
];

const DirectMessagesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const data = await getConversations();
        setConversations(data);
      } catch {
        setConversations(MOCK_CONVERSATIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const filtered = conversations.filter((c) =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 1) return `Il y a ${Math.round(diffMs / 60000)} min`;
    if (diffHours < 24) return `Il y a ${Math.round(diffHours)}h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={0.5}>💬 Messages privés</Typography>
        <Typography variant="body1" color="text.secondary">
          Discutez en privé avec vos camarades
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <UPFSearchBar placeholder="Rechercher une conversation…" value={search} onChange={setSearch} fullWidth />
      </Box>

      <UPFCard noHover padding={0}>
        {loading ? (
          <Box sx={{ p: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, p: 2 }}>
                <Skeleton variant="circular" width={48} height={48} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="40%" height={20} />
                  <Skeleton width="70%" height={16} sx={{ mt: 0.5 }} />
                </Box>
              </Box>
            ))}
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 4 }}>
            <EmptyState
              title="Aucune conversation"
              description="Visitez le réseau pour envoyer un message à un camarade"
              icon={<ChatRoundedIcon />}
            />
          </Box>
        ) : (
          <List disablePadding>
            {filtered.map((conv) => (
              <ListItemButton
                key={conv.userId}
                onClick={() => navigate(`/student/messages/${conv.userId}`)}
                sx={{
                  px: 3, py: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '&:last-child': { borderBottom: 'none' },
                  bgcolor: conv.unreadCount > 0 ? alpha(theme.palette.primary.main, 0.03) : 'transparent',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                }}
              >
                <Box sx={{ mr: 2 }}>
                  <UPFAvatar firstName={conv.firstName} lastName={conv.lastName} online={conv.isOnline} size="large" />
                </Box>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" fontWeight={conv.unreadCount > 0 ? 700 : 500}>
                        {conv.firstName} {conv.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(conv.lastMessageTime)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.3 }}>
                      <Typography
                        variant="body2"
                        color={conv.unreadCount > 0 ? 'text.primary' : 'text.secondary'}
                        fontWeight={conv.unreadCount > 0 ? 500 : 400}
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}
                      >
                        {conv.lastMessage}
                      </Typography>
                      {conv.unreadCount > 0 && (
                        <Badge
                          badgeContent={conv.unreadCount}
                          color="primary"
                          sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: 20, height: 20 } }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </UPFCard>
    </Box>
  );
};

export default DirectMessagesPage;
