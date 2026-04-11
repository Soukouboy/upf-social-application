/**
 * GroupListPage — Liste des groupes
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Skeleton, useTheme, alpha,
  List, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, Paper, Avatar, Button
} from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import FeedRoundedIcon from '@mui/icons-material/FeedRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import UPFChip from '../../components/ui/UPFChip';
import UPFButton from '../../components/ui/UPFButton';
import UPFModal from '../../components/ui/UPFModal';
import EmptyState from '../../components/common/EmptyState';
import { getGroups } from '../../services/groupService';
import { deleteGroup, deactivateGroup, activateGroup } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import type { Group } from '../../types';

const GroupListPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // Admin delete modal
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; group: Group | null }>({ open: false, group: null });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const data = await getGroups();
        setGroups(data);
      } catch {
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteGroup = async () => {
    if (!deleteModal.group) return;
    setActionLoading(true);
    try {
      await deleteGroup(String(deleteModal.group.id));
      setGroups((prev) => prev.filter((g) => g.id !== deleteModal.group!.id));
      setDeleteModal({ open: false, group: null });
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActiveGroup = async (e: React.MouseEvent, group: Group) => {
    e.stopPropagation();
    const isActive = group.isActive !== false;
    try {
      if (isActive) {
        await deactivateGroup(String(group.id));
      } else {
        await activateGroup(String(group.id));
      }
      setGroups(prev => prev.map(g => g.id === group.id ? { ...g, isActive: !isActive } : g));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 4, minHeight: 'calc(100vh - 64px)' }}>
      {/* Sidebar - Inspired by Facebook Groups left panel */}
      <Box sx={{ width: 340, flexShrink: 0, display: { xs: 'none', lg: 'block' }, position: 'sticky', top: 24, height: 'fit-content' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={800}>Groupes</Typography>
          <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.text.primary, 0.05) }}><SettingsRoundedIcon /></IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <UPFSearchBar placeholder="Rechercher des groupes" value={search} onChange={setSearch} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '24px', bgcolor: alpha(theme.palette.text.primary, 0.05), '& fieldset': { border: 'none' } } }} />
        </Box>

        <List disablePadding sx={{ mb: 2 }}>
          <ListItemButton sx={{ borderRadius: 2, mb: 0.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) } }}>
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}><ExploreRoundedIcon /></ListItemIcon>
            <ListItemText primary="Découvrir" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
          <ListItemButton sx={{ borderRadius: 2, mb: 0.5, '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) } }}>
            <ListItemIcon sx={{ minWidth: 40 }}><FeedRoundedIcon /></ListItemIcon>
            <ListItemText primary="Votre fil" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
          <ListItemButton sx={{ borderRadius: 2, mb: 0.5, '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) } }}>
            <ListItemIcon sx={{ minWidth: 40 }}><GroupsRoundedIcon /></ListItemIcon>
            <ListItemText primary="Vos groupes" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </List>

        <Button
          variant="contained"
          fullWidth
          startIcon={<AddRoundedIcon />}
          onClick={() => navigate('/student/groups/create')}
          sx={{ borderRadius: 2, py: 1.2, fontWeight: 600, mb: 3, textTransform: 'none', bgcolor: alpha(theme.palette.primary.main, 0.1), color: '#e4dedeff', boxShadow: 'none', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2), boxShadow: 'none' } }}
        >
          Créer un nouveau groupe
        </Button>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>Groupes dont vous êtes membre</Typography>
          <Button size="small" sx={{ textTransform: 'none' }}>Tout voir</Button>
        </Box>

        <List disablePadding>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, p: 1 }}>
                <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="70%" />
                  <Skeleton width="40%" height={12} />
                </Box>
              </Box>
            ))
          ) : groups.slice(0, 5).map((g) => (
            <ListItemButton key={g.id} onClick={() => navigate(`/student/groups/${g.id}`)} sx={{ borderRadius: 2, mb: 0.5, p: 1 }}>
              <Avatar sx={{ width: 48, height: 48, borderRadius: 2, mr: 2, bgcolor: g.type === 'PUBLIC' ? 'info.main' : 'secondary.main' }}>
                {g.name.substring(0, 1).toUpperCase()}
              </Avatar>
              <ListItemText
                primary={<Typography variant="body2" fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{g.name}</Typography>}
                secondary={<Typography variant="caption" color="text.secondary">En ligne il y a peu</Typography>}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Main Content Area - Visual Feed Layout */}
      <Box sx={{ flex: 1, maxWidth: 800, pt: { xs: 0, lg: 2 } }}>
        {/* Mobile Header elements hidden on desktop */}
        <Box sx={{ display: { xs: 'flex', lg: 'none' }, justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" fontWeight={700}>👥 Groupes</Typography>
          <UPFButton variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/student/groups/create')}>
            Créer un groupe
          </UPFButton>
        </Box>
        <Box sx={{ display: { xs: 'block', lg: 'none' }, mb: 4 }}>
          <UPFSearchBar placeholder="Rechercher un groupe…" value={search} onChange={setSearch} fullWidth />
        </Box>

        <Typography variant="h6" fontWeight={700} mb={3} sx={{ display: { xs: 'none', lg: 'block' } }}>
          Groupes recommandés
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Paper key={i} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                <Skeleton variant="rectangular" height={160} />
                <Box sx={{ p: 2 }}>
                  <Skeleton width="50%" height={32} />
                  <Skeleton width="100%" sx={{ mt: 1 }} />
                  <Skeleton width="80%" />
                </Box>
              </Paper>
            ))}
          </Box>
        ) : filteredGroups.length === 0 ? (
          <EmptyState title="Aucun groupe trouvé" description="Créez un nouveau groupe pour commencer !" icon={<GroupsRoundedIcon />} />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {filteredGroups.map((group) => (
              <Paper
                key={group.id}
                elevation={0}
                onClick={() => navigate(`/student/groups/${group.id}`)}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }
                }}
              >
                {/* Large visually pleasing Cover Area */}
                <Box sx={{
                  height: 140,
                  background: group.type === 'PUBLIC'
                    ? `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.8)}, ${theme.palette.primary.main})`
                    : `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.8)}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {/* Optional: big icon in cover */}
                  {group.type === 'PUBLIC' ? <PublicRoundedIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.4)' }} /> : <LockRoundedIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.4)' }} />}
                </Box>

                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h5" fontWeight={700}>{group.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <UPFChip
                        label={group.type === 'PUBLIC' ? 'Public' : 'Privé'}
                        size="small"
                        colorVariant={group.type === 'PUBLIC' ? 'info' : 'secondary'}
                        icon={group.type === 'PUBLIC' ? <PublicRoundedIcon /> : <LockRoundedIcon />}
                      />
                      {isAdmin && (
                        <UPFChip
                          label={group.isActive !== false ? 'Actif' : 'Inactif'}
                          size="small"
                          colorVariant={group.isActive !== false ? 'success' : 'error'}
                        />
                      )}
                    </Box>
                  </Box>

                  {group.description && (
                    <Typography variant="body1" color="text.secondary" mb={3} sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {group.description}
                    </Typography>
                  )}

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                        <PeopleRoundedIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        {group.memberCount} membre{group.memberCount > 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {isAdmin ? (
                        <>
                          <Button
                            size="small"
                            variant={group.isActive !== false ? 'outlined' : 'contained'}
                            color={group.isActive !== false ? 'warning' : 'success'}
                            onClick={(e) => handleToggleActiveGroup(e, group)}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                          >
                            {group.isActive !== false ? 'Désactiver' : 'Activer'}
                          </Button>
                          <Button size="small" variant="outlined" color="error" onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, group }); }} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                            Supprimer
                          </Button>
                        </>
                      ) : (
                        <Button variant="contained" size="small" sx={{ borderRadius: 2, textTransform: 'none', px: 3, fontWeight: 600 }}>
                          Rejoindre
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>

      {isAdmin && (
        <UPFModal
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, group: null })}
          title="Confirmer la suppression"
          actions={
            <>
              <UPFButton variant="outlined" onClick={() => setDeleteModal({ open: false, group: null })}>Annuler</UPFButton>
              <UPFButton variant="contained" color="error" onClick={handleDeleteGroup} loading={actionLoading}>Supprimer</UPFButton>
            </>
          }
        >
          <Typography>
            Êtes-vous sûr de vouloir supprimer le groupe{' '}
            <strong>{deleteModal.group?.name}</strong> ?
            Cette action est irréversible.
          </Typography>
        </UPFModal>
      )}
    </Box>
  );
};

export default GroupListPage;
