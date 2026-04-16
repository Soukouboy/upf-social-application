/**
 * AdminGroupsPage — Gestion des groupes
 */
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Pagination, useTheme, alpha, Chip, IconButton
} from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFModal from '../../components/ui/UPFModal';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import { getGroups } from '../../services/groupService';
import { deleteGroup, activateGroup, deactivateGroup } from '../../services/adminService';
import type { Group } from '../../types';

const AdminGroupsPage: React.FC = () => {
  const theme = useTheme();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; group: Group | null; action: 'activate' | 'deactivate' | 'delete' }>({ open: false, group: null, action: 'deactivate' });

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
  }, [page]);

  const filteredGroups = groups.filter((g) => {
    if (search && !(`${g.name} ${g.description}`.toLowerCase().includes(search.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const handleAction = async () => {
    if (!confirmModal.group) return;
    const { group, action } = confirmModal;
    
    try {
      if (action === 'delete') {
        await deleteGroup(group.id);
        setGroups(prev => prev.filter(g => g.id !== group.id));
      } else if (action === 'activate') {
        await activateGroup(group.id);
        setGroups(prev => prev.map(g => g.id === group.id ? { ...g, isActive: true } : g));
      } else if (action === 'deactivate') {
        await deactivateGroup(group.id);
        setGroups(prev => prev.map(g => g.id === group.id ? { ...g, isActive: false } : g));
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Une erreur s'est produite lors de l'action sur le groupe.");
    }
    setConfirmModal({ open: false, group: null, action: 'deactivate' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <GroupsRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={700}>Gestion des groupes</Typography>
          <Typography variant="body2" color="text.secondary">{groups.length} groupes au total</Typography>
        </Box>
      </Box>

      {/* Filtres */}
      <UPFCard noHover sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <UPFSearchBar placeholder="Rechercher par nom ou description..." value={search} onChange={setSearch} fullWidth />
          </Box>
        </Box>
      </UPFCard>

      {/* Table */}
      <UPFCard noHover padding={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Filière</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Membres</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} sx={{ p: 3 }}>Chargement...</TableCell></TableRow>
              ) : filteredGroups.length === 0 ? (
                <TableRow><TableCell colSpan={6} sx={{ p: 3, textAlign: 'center' }}>Aucun groupe trouvé.</TableCell></TableRow>
              ) : filteredGroups.slice((page - 1) * 20, page * 20).map((g: any) => {
                const isActive = g.isActive ?? true;
                return (
                  <TableRow key={g.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>{g.name}</Typography></TableCell>
                    <TableCell><Chip label={g.type} size="small" variant="outlined" sx={{ fontWeight: 600 }} /></TableCell>
                    <TableCell><Typography variant="body2">{g.major || 'Général'}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{g.memberCount || 0}</Typography></TableCell>
                    <TableCell>
                      <Chip
                        icon={isActive ? <CheckCircleRoundedIcon /> : <BlockRoundedIcon />}
                        label={isActive ? 'Actif' : 'Inactif'}
                        size="small"
                        color={isActive ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <UPFButton
                          size="small"
                          variant="outlined"
                          color={isActive ? 'error' : 'success'}
                          onClick={() => setConfirmModal({ open: true, group: g, action: isActive ? 'deactivate' : 'activate' })}
                        >
                          {isActive ? 'Désactiver' : 'Activer'}
                        </UPFButton>
                        <IconButton size="small" color="error" onClick={() => setConfirmModal({ open: true, group: g, action: 'delete' })}>
                          <DeleteRoundedIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <Pagination count={Math.ceil(filteredGroups.length / 20) || 1} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      </UPFCard>

      <UPFModal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, group: null, action: 'deactivate' })}
        title={
          confirmModal.action === 'delete' ? 'Supprimer le groupe' :
          confirmModal.action === 'deactivate' ? 'Désactiver le groupe' : 'Réactiver le groupe'
        }
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setConfirmModal({ open: false, group: null, action: 'deactivate' })}>Annuler</UPFButton>
            <UPFButton variant="contained" color={confirmModal.action === 'activate' ? 'success' : 'error'} onClick={handleAction}>
              Confirmer
            </UPFButton>
          </>
        }
      >
        <Typography>
          Êtes-vous sûr de vouloir {confirmModal.action === 'delete' ? 'supprimer' : confirmModal.action === 'deactivate' ? 'désactiver' : 'réactiver'} le groupe{' '}
          <strong>{confirmModal.group?.name}</strong> ?
        </Typography>
      </UPFModal>
    </Box>
  );
};

export default AdminGroupsPage;
