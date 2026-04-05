/**
 * AdminCoursesPage — CRUD des cours (admin)
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
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFModal from '../../components/ui/UPFModal';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import type { Course, CourseCreateRequest, Student } from '../../types';
import { getCourses } from '../../services/courseService';
import { createCourse, updateCourse, deleteCourse, enrollStudent, getUsers } from '../../services/adminService';

const SEMESTRES = [1, 2, 3, 4, 5, 6, 7, 8];
const FILIERES = ['Génie Informatique', 'Génie Civil', 'Génie Électrique', 'Architecture', 'Management'];

const emptyForm: CourseCreateRequest = { title: '', description: '', filiere: '', annee: 1, semestre: 1, professorName: '' };

const AdminCoursesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [form, setForm] = useState<CourseCreateRequest>(emptyForm);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; course: Course | null }>({ open: false, course: null });
  const [enrollModal, setEnrollModal] = useState<{ open: boolean; course: Course | null }>({ open: false, course: null });
  const [enrollStudentId, setEnrollStudentId] = useState<string>('');
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await getCourses();
        setCourses(data.content);
      } catch {
        setCourses([
          { id: 1, code: 'INF301', title: 'Algorithmique avancée', description: 'Structures de données et algorithmes.', filiere: 'Génie Informatique', annee: 3, semestre: 5, professorName: 'Dr. Idrissi', isActive: true, createdAt: '2025-09-01' },
          { id: 2, code: 'INF302', title: 'Programmation Web', description: 'React, Node.js, Spring Boot.', filiere: 'Génie Informatique', annee: 3, semestre: 5, professorName: 'Dr. Chraibi', isActive: true, createdAt: '2025-09-01' },
          { id: 3, code: 'INF303', title: 'Base de données avancées', description: 'SQL, NoSQL, optimisation.', filiere: 'Génie Informatique', annee: 3, semestre: 5, professorName: 'Dr. Amrani', isActive: false, createdAt: '2025-09-01' },
          { id: 4, code: 'GC201', title: 'Mécanique des structures', description: 'Calcul des structures.', filiere: 'Génie Civil', annee: 2, semestre: 3, professorName: 'Dr. Fassi', isActive: true, createdAt: '2025-09-01' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) || c.code?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setFormOpen(true);
  };

  const openEditForm = (course: Course) => {
    setForm({ code: course.code, title: course.title, description: course.description, filiere: course.filiere, annee: course.annee, semestre: course.semestre, professorName: course.professorName });
    setEditId(course.id);
    setFormOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await updateCourse(editId, form);
        setCourses((prev) => prev.map((c) => c.id === editId ? { ...c, ...form } : c));
      } else {
        const newCourse = await createCourse(form);
        setCourses((prev) => [...prev, newCourse]);
      }
    } catch {
      if (!editId) {
        setCourses((prev) => [...prev, { id: Date.now(), ...form, professorName: form.professorName || '', isActive: true, createdAt: new Date().toISOString() } as Course]);
      } else {
        setCourses((prev) => prev.map((c) => c.id === editId ? { ...c, ...form } : c));
      }
    }
    setFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteModal.course) return;
    try { await deleteCourse(deleteModal.course.id); } catch { /* mock */ }
    setCourses((prev) => prev.filter((c) => c.id !== deleteModal.course!.id));
    setDeleteModal({ open: false, course: null });
  };

  const openEnrollModal = async (course: Course) => {
    setEnrollModal({ open: true, course });
    setEnrollStudentId('');
    try {
      const data = await getUsers({ size: 100 });
      setAllStudents(data.content.filter((u) => u.role === 'STUDENT'));
    } catch {
      setAllStudents([]);
    }
  };

  const handleEnrollStudent = async () => {
    if (!enrollModal.course || !enrollStudentId) return;
    setEnrollLoading(true);
    try {
      await enrollStudent(enrollModal.course.id, enrollStudentId);
      setEnrollModal({ open: false, course: null });
      setSuccessMsg('Étudiant inscrit avec succès !');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch { /* mock */ } finally {
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
                <TableCell sx={{ fontWeight: 600 }}>Filière</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Semestre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Enseignant</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} sx={{ p: 3 }}>Chargement…</TableCell></TableRow>
              ) : filtered.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell><Chip label={c.code || '—'} size="small" variant="outlined" /></TableCell>
                  <TableCell><Typography variant="body2" fontWeight={500}>{c.title}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{c.filiere}</Typography></TableCell>
                  <TableCell>S{c.semestre} · {c.annee}A</TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{c.professorName || '—'}</Typography></TableCell>
                  <TableCell>
                    <Chip label={c.isActive !== false ? 'Actif' : 'Inactif'} size="small" color={c.isActive !== false ? 'success' : 'default'} variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <UPFButton size="small" variant="outlined" color="success" startIcon={<PersonAddRoundedIcon />} onClick={() => openEnrollModal(c)}>
                        Inscrire
                      </UPFButton>
                      <UPFButton size="small" variant="outlined" startIcon={<FolderRoundedIcon />} onClick={() => navigate(`/admin/courses/${c.id}/resources`)}>
                        Ressources
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
              ))}
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
          <TextField label="Code (optionnel)" value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value })} size="small" />
          <TextField label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} size="small" required />
          <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} size="small" multiline rows={2} />
          <TextField label="Filière" value={form.filiere} onChange={(e) => setForm({ ...form, filiere: e.target.value })} select size="small">
            {FILIERES.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </TextField>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Année" value={form.annee} onChange={(e) => setForm({ ...form, annee: Number(e.target.value) })} type="number" size="small" sx={{ flex: 1 }} />
            <TextField label="Semestre" value={form.semestre} onChange={(e) => setForm({ ...form, semestre: Number(e.target.value) })} select size="small" sx={{ flex: 1 }}>
              {SEMESTRES.map((s) => <MenuItem key={s} value={s}>Semestre {s}</MenuItem>)}
            </TextField>
          </Box>
          <TextField label="Enseignant" value={form.professorName || ''} onChange={(e) => setForm({ ...form, professorName: e.target.value })} size="small" />
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
          Êtes-vous sûr de vouloir supprimer le cours <strong>{deleteModal.course?.title}</strong> ?
          Cette action est irréversible.
        </Typography>
      </UPFModal>

      {/* Enroll Student Modal */}
      <UPFModal
        open={enrollModal.open}
        onClose={() => setEnrollModal({ open: false, course: null })}
        title={`Inscrire un étudiant — ${enrollModal.course?.title || ''}`}
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setEnrollModal({ open: false, course: null })}>Annuler</UPFButton>
            <UPFButton variant="contained" color="success" onClick={handleEnrollStudent} loading={enrollLoading} disabled={!enrollStudentId}>Inscrire</UPFButton>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Sélectionnez l'étudiant à inscrire au cours <strong>{enrollModal.course?.title}</strong> :
          </Typography>
          <TextField
            label="Étudiant" select fullWidth size="small"
            value={enrollStudentId}
            onChange={(e) => setEnrollStudentId(e.target.value)}
          >
            {allStudents.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>
                {s.firstName} {s.lastName} — {s.filiere} ({s.annee}ème année)
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </UPFModal>
    </Box>
  );
};

export default AdminCoursesPage;
