/**
 * AdminAdminsPage — Gestion des administrateurs
 *
 * SUPER_ADMIN peut :
 *   - Voir la liste de tous les admins
 *   - Créer un nouveau compte administrateur
 *   - Promouvoir un utilisateur existant en ADMIN
 *   - Rétrograder un admin en STUDENT
 */
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, List, ListItem, ListItemText, useTheme, Chip, Alert, TextField,
} from '@mui/material';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFAvatar from '../../components/ui/UPFAvatar';
import UPFModal from '../../components/ui/UPFModal';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import type { Student } from '../../types';
import { getAdmins, getUsers, updateUserRole, createAdmin } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';

const MOCK_ALL_USERS: Student[] = [
  { id: 2, firstName: 'Sarah', lastName: 'Alaoui', email: 'sarah@upf.ac.ma', filiere: 'Génie Électrique', annee: 2, role: 'STUDENT', isActive: true, createdAt: '2025-09-15' },
  { id: 3, firstName: 'Youssef', lastName: 'Karimi', email: 'youssef@upf.ac.ma', filiere: 'Génie Civil', annee: 4, role: 'STUDENT', isActive: true, createdAt: '2024-09-01' },
  { id: 5, firstName: 'Omar', lastName: 'Fassi', email: 'omar@upf.ac.ma', filiere: 'Management', annee: 3, role: 'STUDENT', isActive: true, createdAt: '2025-03-20' },
  { id: 6, firstName: 'Kenza', lastName: 'Moussaoui', email: 'kenza@upf.ac.ma', filiere: 'Génie Informatique', annee: 2, role: 'STUDENT', isActive: true, createdAt: '2025-10-01' },
];

const AdminAdminsPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [admins, setAdmins] = useState<Student[]>([]);
  const [allUsers, setAllUsers] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  // Modal — Promouvoir
  const [promoteModal, setPromoteModal] = useState<{ open: boolean; user: Student | null }>({ open: false, user: null });
  // Modal — Rétrograder
  const [demoteModal, setDemoteModal] = useState<{ open: boolean; user: Student | null }>({ open: false, user: null });
  // Modal — Créer Admin
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [adminData, userData] = await Promise.all([getAdmins(), getUsers({ size: 100 })]);
        setAdmins(adminData);
        setAllUsers(userData.content.filter((u) => u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN'));
      } catch {
        setAdmins([]);
        setAllUsers(MOCK_ALL_USERS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredUsers = allUsers.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handlePromote = async () => {
    if (!promoteModal.user) return;
    try { await updateUserRole(promoteModal.user.id, 'ADMIN'); } catch { /* mock */ }
    const userToPromote = promoteModal.user;
    setAdmins((prev) => [...prev, { ...userToPromote, role: 'ADMIN' }]);
    setAllUsers((prev) => prev.filter((u) => u.id !== userToPromote.id));
    setPromoteModal({ open: false, user: null });
    setSuccess(`${userToPromote.firstName} ${userToPromote.lastName} a été promu administrateur`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDemote = async () => {
    if (!demoteModal.user) return;
    try { await updateUserRole(demoteModal.user.id, 'STUDENT'); } catch { /* mock */ }
    const userToDemote = demoteModal.user;
    setAdmins((prev) => prev.filter((a) => a.id !== userToDemote.id));
    setAllUsers((prev) => [...prev, { ...userToDemote, role: 'STUDENT' }]);
    setDemoteModal({ open: false, user: null });
    setSuccess(`${userToDemote.firstName} ${userToDemote.lastName} a été rétrogradé`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCreateAdmin = async () => {
    if (!createForm.firstName.trim() || !createForm.lastName.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      setCreateError('Veuillez remplir tous les champs.');
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      const newAdmin = await createAdmin(createForm);
      setAdmins((prev) => [...prev, newAdmin]);
      setCreateOpen(false);
      setCreateForm({ firstName: '', lastName: '', email: '', password: '' });
      setSuccess('Compte administrateur créé avec succès !');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setCreateError('Erreur lors de la création du compte.');
    } finally {
      setCreateLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'SUPER_ADMIN') return <Chip label="SUPER ADMIN" size="small" color="secondary" variant="outlined" sx={{ fontWeight: 600 }} />;
    return <Chip label="ADMIN" size="small" color="error" variant="outlined" sx={{ fontWeight: 600 }} />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminPanelSettingsRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>Gestion des administrateurs</Typography>
            <Typography variant="body2" color="text.secondary">
              {isSuperAdmin ? 'Créer, promouvoir ou rétrograder des administrateurs' : 'Promouvoir ou rétrograder des utilisateurs'}
            </Typography>
          </Box>
        </Box>
        {isSuperAdmin && (
          <UPFButton variant="contained" startIcon={<PersonAddRoundedIcon />} onClick={() => setCreateOpen(true)}>
            Créer un administrateur
          </UPFButton>
        )}
      </Box>

      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

      {/* Liste des admins actuels */}
      <Typography variant="h6" fontWeight={600} mb={2}>Administrateurs actuels ({admins.length})</Typography>
      <UPFCard noHover sx={{ mb: 4 }}>
        {loading ? (
          <Typography color="text.secondary">Chargement…</Typography>
        ) : admins.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={3}>Aucun administrateur trouvé</Typography>
        ) : (
          <List disablePadding>
            {admins.map((admin) => (
              <ListItem key={admin.id} sx={{ py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, '&:last-child': { borderBottom: 'none' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <UPFAvatar firstName={admin.firstName} lastName={admin.lastName} />
                  <ListItemText
                    primary={<Typography fontWeight={600}>{admin.firstName} {admin.lastName}</Typography>}
                    secondary={`${admin.email} · ${admin.filiere}`}
                  />
                  {getRoleBadge(admin.role)}
                  {isSuperAdmin && admin.role !== 'SUPER_ADMIN' && (
                    <UPFButton
                      size="small" variant="outlined" color="warning"
                      startIcon={<ArrowDownwardRoundedIcon />}
                      onClick={() => setDemoteModal({ open: true, user: admin })}
                    >
                      Rétrograder
                    </UPFButton>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </UPFCard>

      {/* Promouvoir un utilisateur */}
      <Typography variant="h6" fontWeight={600} mb={2}>Promouvoir un utilisateur</Typography>
      <Box sx={{ mb: 2 }}>
        <UPFSearchBar placeholder="Rechercher un utilisateur à promouvoir…" value={search} onChange={setSearch} fullWidth />
      </Box>
      <UPFCard noHover>
        {filteredUsers.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={3}>Aucun utilisateur trouvé</Typography>
        ) : (
          <List disablePadding>
            {filteredUsers.map((u) => (
              <ListItem key={u.id} sx={{ py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, '&:last-child': { borderBottom: 'none' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <UPFAvatar firstName={u.firstName} lastName={u.lastName} size="small" />
                  <ListItemText
                    primary={`${u.firstName} ${u.lastName}`}
                    secondary={`${u.email} · ${u.filiere} · ${u.annee}ème année`}
                    primaryTypographyProps={{ fontWeight: 500, variant: 'body2' }}
                  />
                  <UPFButton
                    size="small" variant="contained" color="primary"
                    startIcon={<ArrowUpwardRoundedIcon />}
                    onClick={() => setPromoteModal({ open: true, user: u })}
                  >
                    Promouvoir
                  </UPFButton>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </UPFCard>

      {/* Modal — Promouvoir */}
      <UPFModal
        open={promoteModal.open}
        onClose={() => setPromoteModal({ open: false, user: null })}
        title="Promouvoir en administrateur"
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setPromoteModal({ open: false, user: null })}>Annuler</UPFButton>
            <UPFButton variant="contained" onClick={handlePromote}>Confirmer</UPFButton>
          </>
        }
      >
        <Typography>
          Voulez-vous promouvoir <strong>{promoteModal.user?.firstName} {promoteModal.user?.lastName}</strong> au rôle d'administrateur ?
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Cette personne aura accès à toutes les fonctionnalités d'administration.
        </Typography>
      </UPFModal>

      {/* Modal — Rétrograder */}
      <UPFModal
        open={demoteModal.open}
        onClose={() => setDemoteModal({ open: false, user: null })}
        title="Rétrograder l'administrateur"
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setDemoteModal({ open: false, user: null })}>Annuler</UPFButton>
            <UPFButton variant="contained" color="warning" onClick={handleDemote}>Confirmer</UPFButton>
          </>
        }
      >
        <Typography>
          Voulez-vous retirer les droits d'administrateur de <strong>{demoteModal.user?.firstName} {demoteModal.user?.lastName}</strong> ?
        </Typography>
      </UPFModal>

      {/* Modal — Créer un administrateur (SUPER_ADMIN uniquement) */}
      <UPFModal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setCreateError(null); }}
        title="Créer un compte administrateur"
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setCreateOpen(false)}>Annuler</UPFButton>
            <UPFButton variant="contained" onClick={handleCreateAdmin} loading={createLoading}>Créer le compte</UPFButton>
          </>
        }
      >
        {createError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{createError}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Prénom" value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} size="small" required sx={{ flex: 1 }} />
            <TextField label="Nom" value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} size="small" required sx={{ flex: 1 }} />
          </Box>
          <TextField label="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} size="small" required placeholder="prenom.nom@upf.ac.ma" />
          <TextField label="Mot de passe" type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} size="small" required helperText="Minimum 8 caractères" />
        </Box>
      </UPFModal>
    </Box>
  );
};

export default AdminAdminsPage;
