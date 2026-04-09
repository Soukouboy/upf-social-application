/**
 * GroupListPage — Liste des groupes
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Skeleton, useTheme, alpha,
} from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} mb={0.5}>👥 Groupes</Typography>
          <Typography variant="body1" color="text.secondary">
            Rejoignez des groupes d'étude et collaborez avec vos camarades
          </Typography>
        </Box>
        <UPFButton variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/student/groups/create')}>
          Créer un groupe
        </UPFButton>
      </Box>

      <Box sx={{ mb: 4 }}>
        <UPFSearchBar placeholder="Rechercher un groupe…" value={search} onChange={setSearch} fullWidth />
      </Box>

      {loading ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
              <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : filteredGroups.length === 0 ? (
        <EmptyState title="Aucun groupe trouvé" description="Créez un nouveau groupe pour commencer !" icon={<GroupsRoundedIcon />} />
      ) : (
        <Grid container spacing={2.5}>
          {filteredGroups.map((group) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={group.id}>
              <UPFCard
                sx={{ cursor: 'pointer', height: '100%', position: 'relative', overflow: 'hidden' }}
                onClick={() => navigate(`/student/groups/${group.id}`)}
              >
                {/* Bande de couleur en haut */}
                <Box sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                  background: group.type === 'PUBLIC'
                    ? `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`
                    : `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.secondary.main})`,
                }} />

                <Box sx={{ display: 'flex', gap: 1, mb: 2, mt: 1, alignItems: 'center' }}>
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

                <Typography variant="h6" fontWeight={600} mb={0.5}>{group.name}</Typography>
                {group.description && (
                  <Typography variant="body2" color="text.secondary" mb={2}
                    sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {group.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PeopleRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {group.memberCount} membre{group.memberCount > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {isAdmin && (
                      <>
                        <UPFButton
                          size="small"
                          variant={group.isActive !== false ? 'outlined' : 'contained'}
                          color={group.isActive !== false ? 'warning' : 'success'}
                          onClick={(e) => handleToggleActiveGroup(e, group)}
                        >
                          {group.isActive !== false ? 'Désactiver' : 'Activer'}
                        </UPFButton>
                        <UPFButton size="small" variant="outlined" color="error" onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, group }); }}>
                          Supprimer
                        </UPFButton>
                      </>
                    )}
                    {!isAdmin && (
                      <UPFButton size="small" variant="text" endIcon={<ArrowForwardRoundedIcon />} sx={{ color: 'primary.main' }}>
                        Voir
                      </UPFButton>
                    )}
                  </Box>
                </Box>
              </UPFCard>
            </Grid>
          ))}
        </Grid>
      )}

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
