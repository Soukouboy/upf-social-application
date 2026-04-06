/**
 * AdminAdminsPage — Gestion des administrateurs
 *
 * Endpoints utilisés (ENDPIN.md) :
 *   GET    /admin/accounts                         — liste des admins
 *   GET    /admin/students                         — liste des étudiants (pour promotion)
 *   POST   /admin/accounts                         — créer un compte admin
 *   POST   /admin/students/{studentId}/promote     — promouvoir un étudiant en admin
 *   PUT    /admin/accounts/{adminProfileId}/level  — modifier le niveau d'un admin
 *   DELETE /admin/accounts/{adminProfileId}        — révoquer les droits admin
 */
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, List, ListItem, ListItemText, useTheme, Chip, Alert, TextField, MenuItem,
} from '@mui/material';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFAvatar from '../../components/ui/UPFAvatar';
import UPFModal from '../../components/ui/UPFModal';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import type { AdminLevel } from '../../types';
import type { AdminProfileResponse, StudentProfileSummary } from '../../services/adminService';
import {
  getAdminAccounts,
  getStudents,
  createAdminAccount,
  promoteStudentToAdmin,
  updateAdminLevel,
  revokeAdmin,
} from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';

const ADMIN_LEVELS: AdminLevel[] = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'];

const AdminAdminsPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [admins, setAdmins] = useState<AdminProfileResponse[]>([]);
  const [students, setStudents] = useState<StudentProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal — Promouvoir étudiant
  const [promoteModal, setPromoteModal] = useState<{ open: boolean; student: StudentProfileSummary | null; level: AdminLevel }>({
    open: false, student: null, level: 'ADMIN',
  });
  // Modal — Révoquer admin
  const [revokeModal, setRevokeModal] = useState<{ open: boolean; admin: AdminProfileResponse | null }>({
    open: false, admin: null,
  });
  // Modal — Créer compte Admin
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '', lastName: '', email: '', password: '', adminLevel: 'ADMIN' as AdminLevel,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [adminData, studentData] = await Promise.all([
          getAdminAccounts(),
          getStudents(),
        ]);
        setAdmins(adminData);
        setStudents(studentData);
      } catch {
        setAdmins([]);
        setStudents([]);
        setError('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStudents = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3500);
  };

  // Promouvoir un étudiant
  const handlePromote = async () => {
    if (!promoteModal.student) return;
    try {
      const newAdmin = await promoteStudentToAdmin(promoteModal.student.id, promoteModal.level);
      setAdmins((prev) => [...prev, newAdmin]);
      setStudents((prev) => prev.filter((s) => s.id !== promoteModal.student!.id));
      setPromoteModal({ open: false, student: null, level: 'ADMIN' });
      showSuccess(`${promoteModal.student.firstName} a été promu ${promoteModal.level}`);
    } catch {
      setError('Erreur lors de la promotion.');
    }
  };

  // Révoquer un admin
  const handleRevoke = async () => {
    if (!revokeModal.admin) return;
    try {
      await revokeAdmin(revokeModal.admin.id);
      setAdmins((prev) => prev.filter((a) => a.id !== revokeModal.admin!.id));
      setRevokeModal({ open: false, admin: null });
      showSuccess(`Les droits de ${revokeModal.admin.firstName} ont été révoqués.`);
    } catch {
      setError('Erreur lors de la révocation.');
    }
  };

  // Créer un compte admin
  const handleCreateAdmin = async () => {
    const { firstName, lastName, email, password, adminLevel } = createForm;
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setCreateError('Veuillez remplir tous les champs.');
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      const newAdmin = await createAdminAccount({ firstName, lastName, email, password, adminLevel });
      setAdmins((prev) => [...prev, newAdmin]);
      setCreateOpen(false);
      setCreateForm({ firstName: '', lastName: '', email: '', password: '', adminLevel: 'ADMIN' });
      showSuccess('Compte administrateur créé avec succès !');
    } catch {
      setCreateError('Erreur lors de la création du compte.');
    } finally {
      setCreateLoading(false);
    }
  };

  const getLevelChip = (level: AdminLevel) => {
    const colors: Record<AdminLevel, 'secondary' | 'error' | 'primary'> = {
      SUPER_ADMIN: 'secondary',
      ADMIN: 'error',
      MODERATOR: 'primary',
    };
    return <Chip label={level.replace('_', ' ')} size="small" color={colors[level]} variant="outlined" sx={{ fontWeight: 600 }} />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminPanelSettingsRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>Gestion des administrateurs</Typography>
            <Typography variant="body2" color="text.secondary">
              {admins.length} administrateur(s) enregistré(s)
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
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Liste des admins actuels */}
      <Typography variant="h6" fontWeight={600} mb={2}>
        Administrateurs actuels ({admins.length})
      </Typography>
      <UPFCard noHover sx={{ mb: 4 }}>
        {loading ? (
          <Typography color="text.secondary" textAlign="center" py={3}>Chargement…</Typography>
        ) : admins.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={3}>Aucun administrateur trouvé</Typography>
        ) : (
          <List disablePadding>
            {admins.map((admin) => (
              <ListItem
                key={admin.id}
                sx={{ py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, '&:last-child': { borderBottom: 'none' } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <UPFAvatar firstName={admin.firstName} lastName={admin.lastName} />
                  <ListItemText
                    primary={<Typography fontWeight={600}>{admin.firstName} {admin.lastName}</Typography>}
                    secondary={admin.email}
                  />
                  {getLevelChip(admin.adminLevel)}
                  {isSuperAdmin && admin.adminLevel !== 'SUPER_ADMIN' && (
                    <UPFButton
                      size="small" variant="outlined" color="error"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      onClick={() => setRevokeModal({ open: true, admin })}
                    >
                      Révoquer
                    </UPFButton>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </UPFCard>

      {/* Promouvoir un étudiant */}
      <Typography variant="h6" fontWeight={600} mb={2}>Promouvoir un étudiant en admin</Typography>
      <Box sx={{ mb: 2 }}>
        <UPFSearchBar placeholder="Rechercher un étudiant à promouvoir…" value={search} onChange={setSearch} fullWidth />
      </Box>
      <UPFCard noHover>
        {filteredStudents.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={3}>Aucun étudiant trouvé</Typography>
        ) : (
          <List disablePadding>
            {filteredStudents.map((s) => (
              <ListItem
                key={s.id}
                sx={{ py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, '&:last-child': { borderBottom: 'none' } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <UPFAvatar firstName={s.firstName} lastName={s.lastName} size="small" />
                  <ListItemText
                    primary={`${s.firstName} ${s.lastName}`}
                    secondary={`${s.email} · ${s.major} · ${s.currentYear}ème année`}
                    primaryTypographyProps={{ fontWeight: 500, variant: 'body2' }}
                  />
                  <UPFButton
                    size="small" variant="contained" color="primary"
                    startIcon={<ArrowUpwardRoundedIcon />}
                    onClick={() => setPromoteModal({ open: true, student: s, level: 'ADMIN' })}
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
        onClose={() => setPromoteModal({ open: false, student: null, level: 'ADMIN' })}
        title="Promouvoir en administrateur"
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setPromoteModal({ open: false, student: null, level: 'ADMIN' })}>Annuler</UPFButton>
            <UPFButton variant="contained" onClick={handlePromote}>Confirmer</UPFButton>
          </>
        }
      >
        <Typography>
          Promouvoir <strong>{promoteModal.student?.firstName} {promoteModal.student?.lastName}</strong> en administrateur ?
        </Typography>
        <TextField
          select fullWidth size="small" label="Niveau admin" sx={{ mt: 2 }}
          value={promoteModal.level}
          onChange={(e) => setPromoteModal((prev) => ({ ...prev, level: e.target.value as AdminLevel }))}
        >
          {ADMIN_LEVELS.filter((l) => l !== 'SUPER_ADMIN' || isSuperAdmin).map((l) => (
            <MenuItem key={l} value={l}>{l.replace('_', ' ')}</MenuItem>
          ))}
        </TextField>
      </UPFModal>

      {/* Modal — Révoquer */}
      <UPFModal
        open={revokeModal.open}
        onClose={() => setRevokeModal({ open: false, admin: null })}
        title="Révoquer les droits administrateur"
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setRevokeModal({ open: false, admin: null })}>Annuler</UPFButton>
            <UPFButton variant="contained" color="error" onClick={handleRevoke}>Révoquer</UPFButton>
          </>
        }
      >
        <Typography>
          Voulez-vous révoquer les droits d'administrateur de{' '}
          <strong>{revokeModal.admin?.firstName} {revokeModal.admin?.lastName}</strong> ?
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Cette action est irréversible. Le compte utilisateur sera conservé.
        </Typography>
      </UPFModal>

      {/* Modal — Créer Admin */}
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
          <TextField
            select label="Niveau d'accès" value={createForm.adminLevel} size="small"
            onChange={(e) => setCreateForm({ ...createForm, adminLevel: e.target.value as AdminLevel })}
          >
            {ADMIN_LEVELS.filter((l) => l !== 'SUPER_ADMIN' || isSuperAdmin).map((l) => (
              <MenuItem key={l} value={l}>{l.replace('_', ' ')}</MenuItem>
            ))}
          </TextField>
        </Box>
      </UPFModal>
    </Box>
  );
};

export default AdminAdminsPage;
