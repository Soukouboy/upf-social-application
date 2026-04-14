/**
 * GroupListPage — Liste des groupes avec gestion membre/non-membre
 *
 * Fonctionnalités :
 *  - Sépare "Mes groupes" et "Groupes recommandés"
 *  - Bouton conditionnel : Rejoindre (non-membre) / Quitter + Chat + Membres (membre)
 *  - Admin : Activer/Désactiver/Supprimer
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Skeleton, useTheme, alpha,
  List, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, Paper, Avatar, Button,
  Chip, Tooltip, Badge, Collapse
} from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import FeedRoundedIcon from '@mui/icons-material/FeedRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import UPFChip from '../../components/ui/UPFChip';
import UPFButton from '../../components/ui/UPFButton';
import UPFModal from '../../components/ui/UPFModal';
import EmptyState from '../../components/common/EmptyState';
import { getGroups, getMyGroups, leaveGroup, joinGroup, requestJoinGroup } from '../../services/groupService';
import { deleteGroup, deactivateGroup, activateGroup } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import type { Group } from '../../types';

const GroupListPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // Leave modal
  const [leaveModal, setLeaveModal] = useState<{ open: boolean; group: Group | null }>({ open: false, group: null });
  const [leaveLoading, setLeaveLoading] = useState(false);

  // Admin delete modal
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; group: Group | null }>({ open: false, group: null });
  const [actionLoading, setActionLoading] = useState(false);

  // Join loading per group
  const [joinLoadingId, setJoinLoadingId] = useState<string | null>(null);

  // Show/hide sections
  const [showMyGroups, setShowMyGroups] = useState(true);
  const [showRecommended, setShowRecommended] = useState(true);

  // Active sidebar tab
  const [sidebarTab, setSidebarTab] = useState<'discover' | 'feed' | 'mygroups'>('discover');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [publicData, myData] = await Promise.allSettled([
          getGroups(),
          getMyGroups(),
        ]);
        const publicGroups = publicData.status === 'fulfilled' ? publicData.value : [];
        const memberGroups = myData.status === 'fulfilled' ? myData.value : [];
        setAllGroups(publicGroups);
        setMyGroups(memberGroups);
      } catch {
        setAllGroups([]);
        setMyGroups([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // IDs des groupes où l'étudiant est membre
  const myGroupIds = new Set(myGroups.map((g) => g.id));

  // Groupes recommandés = groupes publics dont l'étudiant n'est PAS membre
  const recommendedGroups = allGroups.filter((g) => !myGroupIds.has(g.id));

  // Filtre par recherche
  const filterFn = (g: Group) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description?.toLowerCase().includes(search.toLowerCase());

  const filteredMyGroups = myGroups.filter(filterFn);
  const filteredRecommended = recommendedGroups.filter(filterFn);

  // ──── Handlers ────

  const handleJoinGroup = async (e: React.MouseEvent, group: Group) => {
    e.stopPropagation();
    setJoinLoadingId(group.id);
    try {
      if (group.type === 'PUBLIC') {
        await joinGroup(group.id);
      } else {
        await requestJoinGroup(group.id);
      }
      // Refresh des groupes
      const [publicData, myData] = await Promise.allSettled([getGroups(), getMyGroups()]);
      if (publicData.status === 'fulfilled') setAllGroups(publicData.value);
      if (myData.status === 'fulfilled') setMyGroups(myData.value);
    } catch (err) {
      console.error('Erreur lors de la demande d\'adhésion', err);
    } finally {
      setJoinLoadingId(null);
    }
  };

  const handleLeaveGroup = async () => {
    if (!leaveModal.group) return;
    setLeaveLoading(true);
    try {
      await leaveGroup(leaveModal.group.id);
      setMyGroups((prev) => prev.filter((g) => g.id !== leaveModal.group!.id));
      setLeaveModal({ open: false, group: null });
    } catch (err) {
      console.error('Erreur lors du départ du groupe', err);
    } finally {
      setLeaveLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteModal.group) return;
    setActionLoading(true);
    try {
      await deleteGroup(String(deleteModal.group.id));
      setAllGroups((prev) => prev.filter((g) => g.id !== deleteModal.group!.id));
      setMyGroups((prev) => prev.filter((g) => g.id !== deleteModal.group!.id));
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
      const updateFn = (prev: Group[]) =>
        prev.map((g) => (g.id === group.id ? { ...g, isActive: !isActive } : g));
      setAllGroups(updateFn);
      setMyGroups(updateFn);
    } catch (err) {
      console.error(err);
    }
  };

  // ──── Composant carte de groupe ────

  const renderGroupCard = (group: Group, isMember: boolean) => (
    <Paper
      key={group.id}
      elevation={0}
      onClick={() => navigate(`/student/groups/${group.id}`)}
      sx={{
        borderRadius: 3,
        border: `1px solid ${isMember ? alpha(theme.palette.primary.main, 0.3) : theme.palette.divider}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
        position: 'relative',
      }}
    >
      {/* Badge membre */}
      {isMember && (
        <Chip
          icon={<CheckCircleRoundedIcon />}
          label="Membre"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 2,
            bgcolor: alpha('#fff', 0.95),
            color: 'success.main',
            fontWeight: 700,
            fontSize: '0.7rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            '& .MuiChip-icon': { color: 'success.main' },
          }}
        />
      )}

      {/* Cover */}
      <Box
        sx={{
          height: isMember ? 100 : 140,
          background: group.type === 'PUBLIC'
            ? `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.8)}, ${theme.palette.primary.main})`
            : `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.8)}, ${theme.palette.secondary.main})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {group.type === 'PUBLIC'
          ? <PublicRoundedIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.35)' }} />
          : <LockRoundedIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.35)' }} />
        }
      </Box>

      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" fontWeight={700} sx={{ flex: 1, mr: 1 }}>{group.name}</Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
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
          <Typography
            variant="body2"
            color="text.secondary"
            mb={2}
            sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {group.description}
          </Typography>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Footer : membres count + actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
              <PeopleRoundedIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              {group.memberCount} membre{group.memberCount > 1 ? 's' : ''}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isAdmin ? (
              /* ── Admin actions ── */
              <>
                <Button
                  size="small"
                  variant={group.isActive !== false ? 'outlined' : 'contained'}
                  color={group.isActive !== false ? 'warning' : 'success'}
                  onClick={(e) => handleToggleActiveGroup(e, group)}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                >
                  {group.isActive !== false ? 'Désactiver' : 'Activer'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, group }); }}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                >
                  Supprimer
                </Button>
              </>
            ) : isMember ? (
              /* ── Membre : Chat + Membres + Quitter ── */
              <>
                <Tooltip title="Ouvrir le chat">
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ChatRoundedIcon />}
                    onClick={(e) => { e.stopPropagation(); navigate(`/student/groups/${group.id}/chat`); }}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      px: 2,
                      bgcolor: theme.palette.primary.main,
                      '&:hover': { bgcolor: theme.palette.primary.dark },
                    }}
                  >
                    Chat
                  </Button>
                </Tooltip>
                <Tooltip title="Voir les membres">
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); navigate(`/student/groups/${group.id}`); }}
                    sx={{
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: 'info.main',
                      '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) },
                    }}
                  >
                    <PeopleRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Quitter le groupe">
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutRoundedIcon />}
                    onClick={(e) => { e.stopPropagation(); setLeaveModal({ open: true, group }); }}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  >
                    Quitter
                  </Button>
                </Tooltip>
              </>
            ) : (
              /* ── Non-membre : Rejoindre ── */
              <Button
                variant="contained"
                size="small"
                startIcon={group.type === 'PRIVATE' ? <LockRoundedIcon /> : undefined}
                disabled={joinLoadingId === group.id}
                onClick={(e) => handleJoinGroup(e, group)}
                sx={{ borderRadius: 2, textTransform: 'none', px: 3, fontWeight: 600 }}
              >
                {joinLoadingId === group.id
                  ? 'En cours…'
                  : group.type === 'PUBLIC' ? 'Rejoindre' : 'Demander à rejoindre'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', gap: 4, minHeight: 'calc(100vh - 64px)' }}>
      {/* ──── Sidebar ──── */}
      <Box sx={{ width: 340, flexShrink: 0, display: { xs: 'none', lg: 'block' }, position: 'sticky', top: 24, height: 'fit-content' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={800}>Groupes</Typography>
          <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.text.primary, 0.05) }}><SettingsRoundedIcon /></IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <UPFSearchBar
            placeholder="Rechercher des groupes"
            value={search}
            onChange={setSearch}
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '24px', bgcolor: alpha(theme.palette.text.primary, 0.05), '& fieldset': { border: 'none' } } }}
          />
        </Box>

        <List disablePadding sx={{ mb: 2 }}>
          <ListItemButton
            onClick={() => setSidebarTab('discover')}
            sx={{
              borderRadius: 2, mb: 0.5,
              bgcolor: sidebarTab === 'discover' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              color: sidebarTab === 'discover' ? 'primary.main' : 'text.primary',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}><ExploreRoundedIcon /></ListItemIcon>
            <ListItemText primary="Découvrir" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
          <ListItemButton
            onClick={() => setSidebarTab('feed')}
            sx={{
              borderRadius: 2, mb: 0.5,
              bgcolor: sidebarTab === 'feed' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              color: sidebarTab === 'feed' ? 'primary.main' : 'text.primary',
              '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}><FeedRoundedIcon /></ListItemIcon>
            <ListItemText primary="Votre fil" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
          <ListItemButton
            onClick={() => setSidebarTab('mygroups')}
            sx={{
              borderRadius: 2, mb: 0.5,
              bgcolor: sidebarTab === 'mygroups' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              color: sidebarTab === 'mygroups' ? 'primary.main' : 'text.primary',
              '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <Badge badgeContent={myGroups.length} color="primary" max={99}>
                <GroupsRoundedIcon />
              </Badge>
            </ListItemIcon>
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
          ) : myGroups.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 2 }}>
              Vous n'avez rejoint aucun groupe.
            </Typography>
          ) : myGroups.slice(0, 6).map((g) => (
            <ListItemButton key={g.id} onClick={() => navigate(`/student/groups/${g.id}`)} sx={{ borderRadius: 2, mb: 0.5, p: 1 }}>
              <Avatar sx={{ width: 48, height: 48, borderRadius: 2, mr: 2, bgcolor: g.type === 'PUBLIC' ? 'info.main' : 'secondary.main' }}>
                {g.name.substring(0, 1).toUpperCase()}
              </Avatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {g.name}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {g.memberCount} membre{g.memberCount > 1 ? 's' : ''}
                  </Typography>
                }
              />
              <Tooltip title="Ouvrir le chat">
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); navigate(`/student/groups/${g.id}/chat`); }}
                  sx={{ color: 'primary.main' }}
                >
                  <ChatRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* ──── Main Content ──── */}
      <Box sx={{ flex: 1, maxWidth: 800, pt: { xs: 0, lg: 2 } }}>
        {/* Mobile Header */}
        <Box sx={{ display: { xs: 'flex', lg: 'none' }, justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" fontWeight={700}>👥 Groupes</Typography>
          <UPFButton variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/student/groups/create')}>
            Créer un groupe
          </UPFButton>
        </Box>
        <Box sx={{ display: { xs: 'block', lg: 'none' }, mb: 4 }}>
          <UPFSearchBar placeholder="Rechercher un groupe…" value={search} onChange={setSearch} fullWidth />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Paper key={i} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                <Skeleton variant="rectangular" height={100} />
                <Box sx={{ p: 2 }}>
                  <Skeleton width="50%" height={32} />
                  <Skeleton width="100%" sx={{ mt: 1 }} />
                  <Skeleton width="80%" />
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <>
            {/* ──── Section : Mes Groupes ──── */}
            {filteredMyGroups.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, cursor: 'pointer' }}
                  onClick={() => setShowMyGroups(!showMyGroups)}
                >
                  <GroupsRoundedIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
                    Mes groupes ({filteredMyGroups.length})
                  </Typography>
                  {showMyGroups ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                </Box>
                <Collapse in={showMyGroups}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {filteredMyGroups.map((group) => renderGroupCard(group, true))}
                  </Box>
                </Collapse>
              </Box>
            )}

            {/* ──── Section : Groupes Recommandés ──── */}
            <Box>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, cursor: 'pointer' }}
                onClick={() => setShowRecommended(!showRecommended)}
              >
                <ExploreRoundedIcon sx={{ color: 'secondary.main' }} />
                <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
                  Groupes recommandés ({filteredRecommended.length})
                </Typography>
                {showRecommended ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              </Box>
              <Collapse in={showRecommended}>
                {filteredRecommended.length === 0 ? (
                  <EmptyState
                    title="Aucun groupe trouvé"
                    description={search ? 'Ajustez votre recherche.' : 'Créez un nouveau groupe pour commencer !'}
                    icon={<GroupsRoundedIcon />}
                  />
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {filteredRecommended.map((group) => renderGroupCard(group, false))}
                  </Box>
                )}
              </Collapse>
            </Box>

            {/* Empty state quand les deux sections sont vides */}
            {filteredMyGroups.length === 0 && filteredRecommended.length === 0 && (
              <EmptyState
                title="Aucun groupe trouvé"
                description="Créez un nouveau groupe pour commencer !"
                icon={<GroupsRoundedIcon />}
              />
            )}
          </>
        )}
      </Box>

      {/* ──── Modal Quitter ──── */}
      <UPFModal
        open={leaveModal.open}
        onClose={() => setLeaveModal({ open: false, group: null })}
        title="Quitter le groupe"
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setLeaveModal({ open: false, group: null })}>Annuler</UPFButton>
            <UPFButton variant="contained" color="error" onClick={handleLeaveGroup} loading={leaveLoading}>
              Quitter
            </UPFButton>
          </>
        }
      >
        <Typography>
          Êtes-vous sûr de vouloir quitter le groupe{' '}
          <strong>{leaveModal.group?.name}</strong> ?
          Vous ne pourrez plus accéder au chat ni aux ressources du groupe.
        </Typography>
      </UPFModal>

      {/* ──── Modal Supprimer (Admin) ──── */}
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
