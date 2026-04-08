/**
 * AdminProfessorsPage — Gestion des professeurs
 *
 * Fonctionnalités :
 *   - Liste des professeurs avec leurs cours affectés
 *   - Créer un nouveau compte professeur
 *   - Affecter un cours existant à un professeur
 */
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, useTheme, alpha, Chip, Alert,
} from '@mui/material';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFAvatar from '../../components/ui/UPFAvatar';
import UPFModal from '../../components/ui/UPFModal';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import type { CourseSummary } from '../../types';
import type { ProfessorProfileResponse } from '../../services/adminService';
import { getProfessors, createProfessor, assignCourseToProf, getAdminCourses } from '../../services/adminService';

// Filières disponibles
const DEPARTMENTS = [
  "Faculté des Sciences de l'Ingénieur",
  'Fès Business School',
  'Facultés de medecine dentaire',
  'Faculté des sciences Paramédicales et techniques de santé',
  "Ecole supérieure des métiers de l'architecture",
  'CAMPUS RABAT ISSI',
  'SCIENCES PO',
  'CENTRE DE RECHERCHE,DEVELOPPEMENT ,EXPERTISE ET INNOVATION',
  "CENTRE DES ETUDES DOCTORALES",
  "CENTRE DE LANGUES,CULTURE ET SOFT-SKILLS"
];

const TITLES = ['Dr.', 'Pr.', 'M.', 'Mme'];

const AdminProfessorsPage: React.FC = () => {
  const theme = useTheme();
  const [professors, setProfessors] = useState<ProfessorProfileResponse[]>([]);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  // Modal — Créer professeur
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '', lastName: '', email: '', password: '', department: '', title: 'Dr.',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Modal — Affecter un cours
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignProfId, setAssignProfId] = useState<string | null>(null);
  const [assignCourseId, setAssignCourseId] = useState<number | string>('');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profData, courseData] = await Promise.all([
          getProfessors(),
          getAdminCourses(),
        ]);
        setProfessors(profData as any);
        setCourses(courseData.content);
      } catch {
        // Fallback data already in mock
        setProfessors([]);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProfessors = professors.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.email} ${p.department || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateProfessor = async () => {
    if (!createForm.firstName.trim() || !createForm.lastName.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      setCreateError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      const newProf = await createProfessor({
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        department: createForm.department || undefined,
        title: createForm.title || undefined,
      });
      setProfessors((prev) => [...prev, newProf]);
      setCreateOpen(false);
      setCreateForm({ firstName: '', lastName: '', email: '', password: '', department: '', title: 'Dr.' });
      setSuccess('Compte professeur créé avec succès !');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setCreateError('Erreur lors de la création du compte.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAssignCourse = async () => {
    if (!assignProfId || !assignCourseId) return;
    setAssignLoading(true);
    try {
      // PUT /admin/professors/{professorId}/courses/{courseId}
      const updated = await assignCourseToProf(assignProfId, String(assignCourseId));
      // setProfessors((prev) => prev.map((p) =>
      //   p.id === assignProfId ? { ...p, courses: updated.courses } as any : p
      // ));
      setAssignOpen(false);
      setAssignCourseId('');
      setSuccess('Cours affecté avec succès !');
      setTimeout(() => setSuccess(null), 3000);
    } catch { /* mock */ } finally {
      setAssignLoading(false);
    }
  };

  const openAssignModal = (profId: string) => {
    setAssignProfId(profId);
    setAssignCourseId('');
    setAssignOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SchoolRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>Gestion des professeurs</Typography>
            <Typography variant="body2" color="text.secondary">{professors.length} professeurs enregistrés</Typography>
          </Box>
        </Box>
        <UPFButton variant="contained" startIcon={<PersonAddRoundedIcon />} onClick={() => setCreateOpen(true)}>
          Créer un compte professeur
        </UPFButton>
      </Box>

      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

      <Box sx={{ mb: 3 }}>
        <UPFSearchBar placeholder="Rechercher un professeur…" value={search} onChange={setSearch} fullWidth />
      </Box>

      <UPFCard noHover padding={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <TableCell sx={{ fontWeight: 600 }}>Professeur</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Département</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Titre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cours affectés</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} sx={{ p: 3, textAlign: 'center' }}>Chargement…</TableCell></TableRow>
              ) : filteredProfessors.length === 0 ? (
                <TableRow><TableCell colSpan={6} sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">Aucun professeur trouvé</Typography>
                </TableCell></TableRow>
              ) : filteredProfessors.map((prof) => (
                <TableRow key={prof.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <UPFAvatar firstName={prof.firstName} lastName={prof.lastName} size="small" />
                      <Typography variant="body2" fontWeight={500}>{prof.title} {prof.firstName} {prof.lastName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{prof.email}</Typography></TableCell>
                  <TableCell><Chip label={prof.department || '—'} size="small" variant="outlined" /></TableCell>
                  <TableCell><Typography variant="body2">{prof.title || '—'}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {(prof.courseNames || []).length === 0 ? (
                        <Typography variant="caption" color="text.secondary">Aucun cours</Typography>
                      ) : (
                        (prof.courseNames || []).map((c) => (
                          <Chip key={c} label={c} size="small" color="primary" variant="outlined" sx={{ fontWeight: 500 }} />
                        ))
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <UPFButton
                      size="small" variant="outlined" color="primary"
                      startIcon={<LinkRoundedIcon />}
                      onClick={() => openAssignModal(prof.id)}
                    >
                      Affecter un cours
                    </UPFButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </UPFCard>

      {/* Modal — Créer un professeur */}
      <UPFModal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setCreateError(null); }}
        title="Créer un compte professeur"
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setCreateOpen(false)}>Annuler</UPFButton>
            <UPFButton variant="contained" onClick={handleCreateProfessor} loading={createLoading}>Créer le compte</UPFButton>
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
          <TextField label="Titre" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} select size="small">
            {TITLES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField label="Département" value={createForm.department} onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })} select size="small">
            {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
        </Box>
      </UPFModal>

      {/* Modal — Affecter un cours */}
      <UPFModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Affecter un cours au professeur"
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setAssignOpen(false)}>Annuler</UPFButton>
            <UPFButton variant="contained" onClick={handleAssignCourse} loading={assignLoading} disabled={!assignCourseId}>Affecter</UPFButton>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Sélectionnez un cours à affecter à ce professeur :
          </Typography>
          <TextField
            label="Cours" select fullWidth size="small"
            value={assignCourseId}
            onChange={(e) => setAssignCourseId(e.target.value)}
          >
            {courses.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MenuBookRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  <span>{c.code ? `[${c.code}] ` : ''}{c.title ?? (c as any).name}</span>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </UPFModal>
    </Box>
  );
};

export default AdminProfessorsPage;
