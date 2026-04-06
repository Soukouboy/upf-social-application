/**
 * AdminUsersPage — Gestion des utilisateurs
 */
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, Pagination, useTheme, alpha, Chip,
} from '@mui/material';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFAvatar from '../../components/ui/UPFAvatar';
import UPFModal from '../../components/ui/UPFModal';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import type { StudentProfileSummary } from '../../types';
import { getStudents, updateUserStatus } from '../../services/adminService';

const FILIERES = ['Tous', 'Génie Informatique', 'Génie Civil', 'Génie Électrique', 'Architecture', 'Management'];

const MOCK_USERS: any[] = [
  { id: '1', firstName: 'Amine', lastName: 'Benali', email: 'amine@upf.ac.ma', major: 'Génie Informatique', currentYear: 3, role: 'ADMIN', isActive: true, createdAt: '2025-09-01' },
  { id: '2', firstName: 'Sarah', lastName: 'Alaoui', email: 'sarah@upf.ac.ma', major: 'Génie Électrique', currentYear: 2, role: 'STUDENT', isActive: true, createdAt: '2025-09-15' },
  { id: '3', firstName: 'Youssef', lastName: 'Karimi', email: 'youssef@upf.ac.ma', major: 'Génie Civil', currentYear: 4, role: 'STUDENT', isActive: true, createdAt: '2024-09-01' },
  { id: '4', firstName: 'Lina', lastName: 'Tazi', email: 'lina@upf.ac.ma', major: 'Architecture', currentYear: 1, role: 'STUDENT', isActive: false, createdAt: '2026-01-10' },
  { id: '5', firstName: 'Omar', lastName: 'Fassi', email: 'omar@upf.ac.ma', major: 'Management', currentYear: 3, role: 'STUDENT', isActive: true, createdAt: '2025-03-20' },
  { id: '6', firstName: 'Kenza', lastName: 'Moussaoui', email: 'kenza@upf.ac.ma', major: 'Génie Informatique', currentYear: 2, role: 'STUDENT', isActive: true, createdAt: '2025-10-01' },
  { id: '7', firstName: 'Mehdi', lastName: 'Bennani', email: 'mehdi@upf.ac.ma', major: 'Génie Informatique', currentYear: 4, role: 'ADMIN', isActive: true, createdAt: '2024-09-01' },
];

const AdminUsersPage: React.FC = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<StudentProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filiere, setFiliere] = useState('Tous');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; user: any | null; action: 'activate' | 'deactivate' }>({ open: false, user: null, action: 'deactivate' });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getStudents();
        setUsers(data);
      } catch {
        setUsers(MOCK_USERS);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, search, filiere]);

  const filteredUsers = users.filter((u: any) => {
    const isActive = u.isActive ?? true;
    if (statusFilter === 'active' && !isActive) return false;
    if (statusFilter === 'inactive' && isActive) return false;

    // Filtrage par nom/email
    if (search && !(`${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()))) {
      return false;
    }

    // Filtrage par filière
    if (filiere !== 'Tous' && u.major && u.major !== filiere) {
      return false;
    }

    return true;
  });

  const handleStatusToggle = async () => {
    if (!confirmModal.user) return;
    const newStatus = confirmModal.action === 'activate';
    try {
      await updateUserStatus(confirmModal.user.id, newStatus);
    } catch { /* mock */ }
    setUsers((prev) => prev.map((u) => u.id === confirmModal.user!.id ? { ...u, isActive: newStatus } : u));
    setConfirmModal({ open: false, user: null, action: 'deactivate' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <PeopleRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={700}>Gestion des utilisateurs</Typography>
          <Typography variant="body2" color="text.secondary">{users.length} utilisateurs enregistrés</Typography>
        </Box>
      </Box>

      {/* Filtres */}
      <UPFCard noHover sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <UPFSearchBar placeholder="Rechercher par nom, email…" value={search} onChange={setSearch} fullWidth />
          </Box>
          <TextField select size="small" label="Filière" value={filiere} onChange={(e) => setFiliere(e.target.value)} sx={{ minWidth: 180 }}>
            {FILIERES.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Statut" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')} sx={{ minWidth: 130 }}>
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="active">Actifs</MenuItem>
            <MenuItem value="inactive">Inactifs</MenuItem>
          </TextField>
        </Box>
      </UPFCard>

      {/* Table */}
      <UPFCard noHover padding={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <TableCell sx={{ fontWeight: 600 }}>Utilisateur</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Filière</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Année</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rôle</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7} sx={{ p: 3 }}>Chargement...</TableCell></TableRow>
                ))
              ) : filteredUsers.slice((page - 1) * 20, page * 20).map((u: any) => {
                const role = u.role || 'STUDENT';
                const isActive = u.isActive ?? true;
                return (
                  <TableRow key={u.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <UPFAvatar firstName={u.firstName} lastName={u.lastName} size="small" />
                        <Typography variant="body2" fontWeight={500}>{u.firstName} {u.lastName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{u.email}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{u.major}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{u.currentYear}</Typography></TableCell>
                    <TableCell>
                      <Chip label={role} size="small" color={role === 'ADMIN' ? 'error' : 'default'} variant="outlined" sx={{ fontWeight: 600 }} />
                    </TableCell>
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
                      <UPFButton
                        size="small"
                        variant={isActive ? 'outlined' : 'contained'}
                        color={isActive ? 'error' : 'success'}
                        onClick={() => setConfirmModal({ open: true, user: u, action: isActive ? 'deactivate' : 'activate' })}
                      >
                        {isActive ? 'Désactiver' : 'Activer'}
                      </UPFButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <Pagination count={Math.ceil(filteredUsers.length / 20) || 1} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      </UPFCard>

      {/* Modal de confirmation */}
      <UPFModal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, user: null, action: 'deactivate' })}
        title={confirmModal.action === 'deactivate' ? 'Désactiver l\'utilisateur' : 'Réactiver l\'utilisateur'}
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setConfirmModal({ open: false, user: null, action: 'deactivate' })}>Annuler</UPFButton>
            <UPFButton variant="contained" color={confirmModal.action === 'deactivate' ? 'error' : 'success'} onClick={handleStatusToggle}>
              Confirmer
            </UPFButton>
          </>
        }
      >
        <Typography>
          Êtes-vous sûr de vouloir {confirmModal.action === 'deactivate' ? 'désactiver' : 'réactiver'} le compte de{' '}
          <strong>{confirmModal.user?.firstName} {confirmModal.user?.lastName}</strong> ?
        </Typography>
        {confirmModal.action === 'deactivate' && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            L'utilisateur ne pourra plus se connecter à la plateforme.
          </Typography>
        )}
      </UPFModal>
    </Box>
  );
};

export default AdminUsersPage;
