/**
 * AdminCoursesPage — CRUD des cours (admin)
 *
 * Endpoints utilisés (ENDPIN.md / AdminCourseController) :
 *   GET    /admin/courses                        — liste paginée (CourseSummary)
 *   POST   /admin/courses                        — créer un cours
 *   PUT    /admin/courses/{courseId}             — modifier un cours
 *   DELETE /admin/courses/{courseId}             — supprimer un cours
 *   PATCH  /admin/courses/{courseId}/activate    — activer un cours
 *   PATCH  /admin/courses/{courseId}/deactivate  — désactiver un cours
 *   POST   /admin/students/{studentId}/enroll/{courseId} — inscrire un étudiant
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, useTheme, alpha, Chip, Alert,
} from '@mui/material';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFModal from '../../components/ui/UPFModal';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import type { CourseSummary } from '../../types';
import type { StudentProfileSummary, CreateCourseAdminRequest } from '../../services/adminService';
import {
  getAdminCourses, createCourse, updateCourse, deleteCourse,
  enrollStudent, getStudents, activateCourse, deactivateCourse,
} from '../../services/adminService';


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


const emptyForm: CreateCourseAdminRequest = {
  title: '', description: '', code: '', credits: 3, major: '', semester: 1,
};

const AdminCoursesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateCourseAdminRequest>(emptyForm);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; course: CourseSummary | null }>({ open: false, course: null });
  const [enrollModal, setEnrollModal] = useState<{ open: boolean; course: CourseSummary | null }>({ open: false, course: null });
  const [enrollStudentId, setEnrollStudentId] = useState<string>('');
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [allStudents, setAllStudents] = useState<StudentProfileSummary[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await getAdminCourses();
      setCourses(data.content);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter((c) =>
    (c.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.code ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setFormOpen(true);
  };

  const openEditForm = (course: CreateCourseAdminRequest) => {
    setForm({
      title: (course as any).name ?? course.title ?? '',
      code: course.code ?? '',
      description: (course as any).description ?? '',
      credits: course.credits ?? 3,
      major: (course as any).department ?? '',
      semester: Number((course as any).semester ?? ''),
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        const updated = await updateCourse(editId, form);
        setCourses((prev) => prev.map((c) => c.id === editId ? updated : c));
      } else {
        const newCourse = await createCourse(form);
        setCourses((prev) => [...prev, newCourse]);
      }
      setSuccessMsg(editId ? 'Cours modifié avec succès !' : 'Cours créé avec succès !');
    } catch {
      setErrorMsg('Erreur lors de l\'enregistrement du cours.');
    }
    setFormOpen(false);
    setTimeout(() => { setSuccessMsg(null); setErrorMsg(null); }, 3000);
  };

  const handleDelete = async () => {
    if (!deleteModal.course) return;
    try {
      await deleteCourse(String(deleteModal.course.id));
      setCourses((prev) => prev.filter((c) => c.id !== deleteModal.course!.id));
      setSuccessMsg('Cours supprimé.');
    } catch {
      setErrorMsg('Erreur lors de la suppression.');
    }
    setDeleteModal({ open: false, course: null });
    setTimeout(() => { setSuccessMsg(null); setErrorMsg(null); }, 3000);
  };

  const handleToggleActive = async (course: CourseSummary) => {
    try {
      const isActive = (course as any).isActive !== false;
      const updated = isActive
        ? await deactivateCourse(String(course.id))
        : await activateCourse(String(course.id));
      setCourses((prev) => prev.map((c) => c.id === course.id ? updated : c));
    } catch {
      setErrorMsg('Erreur lors du changement de statut.');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const openEnrollModal = async (course: CourseSummary) => {
    setEnrollModal({ open: true, course });
    setEnrollStudentId('');
    try {
      const data = await getStudents();
      setAllStudents(data);
    } catch {
      setAllStudents([]);
    }
  };

  const handleEnrollStudent = async () => {
    if (!enrollModal.course || !enrollStudentId) return;
    setEnrollLoading(true);
    try {
      // POST /admin/students/{studentId}/enroll/{courseId}
      await enrollStudent(enrollStudentId, String(enrollModal.course.id));
      setEnrollModal({ open: false, course: null });
      setSuccessMsg('Étudiant inscrit avec succès !');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setErrorMsg('Erreur lors de l\'inscription.');
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setEnrollLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MenuBookRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>Gestion des cours</Typography>
            <Typography variant="body2" color="text.secondary">{courses.length} cours enregistrés</Typography>
          </Box>
        </Box>
        <UPFButton variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreateForm}>
          Ajouter un cours
        </UPFButton>
      </Box>

      {successMsg && <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>{errorMsg}</Alert>}

      <Box sx={{ mb: 3 }}>
        <UPFSearchBar placeholder="Rechercher un cours…" value={search} onChange={setSearch} fullWidth />
      </Box>

      <UPFCard noHover padding={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Titre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Crédits</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Département</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Semestre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} sx={{ p: 3 }}>Chargement…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">Aucun cours trouvé</Typography>
                </TableCell></TableRow>
              ) : filtered.map((c) => {
                const isActive = (c as any).isActive !== false;
                return (
                  <TableRow key={c.id} hover>
                    <TableCell><Chip label={c.code || '—'} size="small" variant="outlined" /></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={500}>{c.title ?? (c as any).name ?? '—'}</Typography></TableCell>
                    <TableCell>{c.credits ?? '—'}</TableCell>
                    <TableCell><Typography variant="body2">{(c as any).department ?? (c as any).major ?? '—'}</Typography></TableCell>
                    <TableCell>S{(c as any).semester ?? (c as any).semestre ?? '—'}</TableCell>
                    <TableCell>
                      <Chip label={isActive ? 'Actif' : 'Inactif'} size="small" color={isActive ? 'success' : 'default'} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <UPFButton size="small" variant="outlined" color="success" startIcon={<PersonAddRoundedIcon />} onClick={() => openEnrollModal(c)}>
                          Inscrire
                        </UPFButton>
                        <UPFButton size="small" variant="outlined" startIcon={<FolderRoundedIcon />} onClick={() => navigate(`/admin/courses/${c.id}/resources`)}>
                          Ressources
                        </UPFButton>
                        <UPFButton
                          size="small" variant="outlined"
                          color={isActive ? 'warning' : 'success'}
                          startIcon={<PowerSettingsNewRoundedIcon />}
                          onClick={() => handleToggleActive(c)}
                        >
                          {isActive ? 'Désactiver' : 'Activer'}
                        </UPFButton>
                        <UPFButton size="small" variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => openEditForm(c)}>
                          Modifier
                        </UPFButton>
                        <UPFButton size="small" variant="outlined" color="error" startIcon={<DeleteRoundedIcon />} onClick={() => setDeleteModal({ open: true, course: c })}>
                          Supprimer
                        </UPFButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </UPFCard>

      {/* Create/Edit Modal */}
      <UPFModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editId ? 'Modifier le cours' : 'Ajouter un cours'}
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setFormOpen(false)}>Annuler</UPFButton>
            <UPFButton variant="contained" onClick={handleSave}>Enregistrer</UPFButton>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} size="small" required />
          <TextField label="Nom du cours" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} size="small" required />
          <TextField label="Description" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} size="small" multiline rows={2} />
          <TextField label="Filière" value={form.major ?? ''} onChange={(e) => setForm({ ...form, major: e.target.value })} select size="small">
            {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Crédits" value={form.credits} onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })} type="number" size="small" sx={{ flex: 1 }} />
            <TextField label="Semestre" value={form.semester ?? ''} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })} size="small" sx={{ flex: 1 }} placeholder="Ex: 1, 2, " />
          </Box>
        </Box>
      </UPFModal>

      {/* Delete Modal */}
      <UPFModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, course: null })}
        title="Supprimer le cours"
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setDeleteModal({ open: false, course: null })}>Annuler</UPFButton>
            <UPFButton variant="contained" color="error" onClick={handleDelete}>Supprimer</UPFButton>
          </>
        }
      >
        <Typography>
          Êtes-vous sûr de vouloir supprimer le cours{' '}
          <strong>{deleteModal.course?.title ?? (deleteModal.course as any)?.name}</strong> ?{' '}
          Cette action est irréversible.
        </Typography>
      </UPFModal>

      {/* Enroll Student Modal */}
      <UPFModal
        open={enrollModal.open}
        onClose={() => setEnrollModal({ open: false, course: null })}
        title={`Inscrire un étudiant — ${enrollModal.course?.title ?? (enrollModal.course as any)?.name ?? ''}`}
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setEnrollModal({ open: false, course: null })}>Annuler</UPFButton>
            <UPFButton variant="contained" color="success" onClick={handleEnrollStudent} loading={enrollLoading} disabled={!enrollStudentId}>Inscrire</UPFButton>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Sélectionnez l'étudiant à inscrire :
          </Typography>
          <TextField
            label="Étudiant" select fullWidth size="small"
            value={enrollStudentId}
            onChange={(e) => setEnrollStudentId(e.target.value)}
          >
            {allStudents.length === 0 && <MenuItem disabled value="">Aucun étudiant disponible</MenuItem>}
            {allStudents.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>
                {s.firstName} {s.lastName} — {s.major} ({s.currentYear}ème année)
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </UPFModal>
    </Box>
  );
};

export default AdminCoursesPage;
