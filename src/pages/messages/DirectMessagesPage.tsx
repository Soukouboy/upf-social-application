/**
 * DirectMessagesPage — Liste des conversations privées (DM)
 *
 * Utilise GET /messages/private — retourne Page<PrivateConversationSummaryResponse>
 * Le backend ne renvoie que otherUserId + lastMessageAt, donc on enrichit avec getUserProfile()
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, List, ListItemButton, ListItemText,
  Skeleton, useTheme, alpha, Badge, IconButton, Button
} from '@mui/material';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import EditSquareRoundedIcon from '@mui/icons-material/EditRounded';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import UPFAvatar from '../../components/ui/UPFAvatar';
import EmptyState from '../../components/common/EmptyState';
import type { PrivateConversationSummaryResponse } from '../../types';
import { getPrivateConversations } from '../../services/messageService';
import { getUserProfile } from '../../services/userService';

const DirectMessagesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<PrivateConversationSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const page = await getPrivateConversations(0, 50);
        const rawConversations = page.content;

        // Enrichir chaque conversation avec le profil de l'interlocuteur
        // pour afficher son nom/prénom au lieu de l'ID
        const enriched = await Promise.all(
          rawConversations.map(async (conv) => {
            // Si le backend a déjà fourni le nom, pas besoin de fetch
            if (conv.firstName && conv.lastName) return conv;

            try {
              const profile = await getUserProfile(conv.otherUserId);
              return {
                ...conv,
                firstName: profile.firstName || conv.firstName,
                lastName: profile.lastName || conv.lastName,
                avatarUrl: profile.profilePictureUrl || conv.avatarUrl,
              };
            } catch {
              // En cas d'erreur on garde ce qu'on a
              return conv;
            }
          })
        );

        setConversations(enriched);
      } catch (err) {
        setError('Impossible de charger les conversations. Vérifiez votre connexion.');
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const filtered = conversations.filter((c) => {
    const name = `${c.firstName ?? ''} ${c.lastName ?? ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 1) return `Il y a ${Math.max(1, Math.round(diffMs / 60000))} min`;
    if (diffHours < 24) return `Il y a ${Math.round(diffHours)}h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getDisplayName = (conv: PrivateConversationSummaryResponse) => {
    if (conv.firstName || conv.lastName) {
      return `${conv.firstName ?? ''} ${conv.lastName ?? ''}`.trim();
    }
    // Fallback ultime si aucun nom n'est disponible
    return `Utilisateur ${conv.otherUserId.substring(0, 8)}…`;
  };

  // Mock check for online status (visual representation)
  const isOnline = (id: string) => {
    return parseInt(id.replace(/\D/g, '') || '0') % 2 === 0;
  };

  return (
    <Box sx={{ maxWidth: 400, borderRight: `1px solid ${theme.palette.divider}`, minHeight: '80vh', pr: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>Discussions</Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.text.primary, 0.05) }}><MoreHorizRoundedIcon fontSize="small" /></IconButton>
          <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.text.primary, 0.05) }}><OpenInFullRoundedIcon fontSize="small" /></IconButton>
          <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.text.primary, 0.05) }}><EditSquareRoundedIcon fontSize="small" /></IconButton>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <UPFSearchBar 
          placeholder="Rechercher dans Messenger" 
          value={search} 
          onChange={setSearch} 
          fullWidth 
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '24px', bgcolor: alpha(theme.palette.text.primary, 0.05), '& fieldset': { border: 'none' } } }}
        />
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
        <Button variant="contained" size="small" sx={{ borderRadius: '20px', textTransform: 'none', px: 2, boxShadow: 'none' }}>Tout</Button>
        <Button variant="text" size="small" sx={{ borderRadius: '20px', textTransform: 'none', color: 'text.primary', fontWeight: 600, '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) } }}>Non lu</Button>
        <Button variant="text" size="small" sx={{ borderRadius: '20px', textTransform: 'none', color: 'text.primary', fontWeight: 600, '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) } }}>Groupes</Button>
      </Box>

      {/* Optional Help Box */}
      <Box sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: alpha(theme.palette.text.primary, 0.04), color: 'text.secondary', fontSize: '0.85rem' }}>
        Historique des discussions manquant. <Typography component="span" variant="body2" sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Restaurer maintenant</Typography>
      </Box>

      {/* Messages List Area */}
      {loading ? (
        <Box sx={{ p: 1 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2, p: 1.5 }}>
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="40%" height={20} />
                <Skeleton width="70%" height={16} sx={{ mt: 0.5 }} />
              </Box>
            </Box>
          ))}
        </Box>
      ) : error ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="body2">{error}</Typography>
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
              key={conv.otherUserId}
              onClick={() => navigate(`/student/messages/${conv.otherUserId}`)}
              sx={{
                px: 1.5, py: 1.2,
                borderRadius: 2,
                mb: 0.5,
                bgcolor: (conv.unreadCount ?? 0) > 0 ? alpha(theme.palette.primary.main, 0.03) : 'transparent',
                '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.04) },
              }}
            >
              <Box sx={{ mr: 2, position: 'relative' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#31a24c',
                      color: '#31a24c',
                      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                      '&::after': {
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '50%',
                        animation: 'ripple 1.2s infinite ease-in-out',
                        border: '1px solid currentColor',
                        content: '""',
                      },
                      display: isOnline(conv.otherUserId) ? 'block' : 'none',
                    },
                  }}
                >
                  <UPFAvatar
                    firstName={conv.firstName ?? '?'}
                    lastName={conv.lastName ?? ''}
                    size="large"
                  />
                </Badge>
              </Box>
              <ListItemText
                primary={
                   <Typography variant="subtitle2" fontWeight={600}>
                     {getDisplayName(conv)}
                   </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.2 }}>
                    <Typography
                      variant="body2"
                      color={(conv.unreadCount ?? 0) > 0 ? 'text.primary' : 'text.secondary'}
                      fontWeight={(conv.unreadCount ?? 0) > 0 ? 600 : 400}
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}
                    >
                      {conv.lastMessage ?? 'Nouveau message'}
                    </Typography>
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                      · {formatTime(conv.lastMessageAt)}
                    </Typography>
                  </Box>
                }
              />
              {(conv.unreadCount ?? 0) > 0 && (
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
              )}
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
};

export default DirectMessagesPage;
