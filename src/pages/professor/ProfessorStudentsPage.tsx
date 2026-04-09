/**
 * ProfessorStudentsPage — Gestion des étudiants par le professeur
 *
 * Nouvelles fonctionnalités :
 *   - Inscrire un étudiant dans un cours (via modal de sélection)
 *   - Désinscrire un étudiant (si endpoint disponible)
 */
import React, { useState, useEffect } from 'react';
import {
  TextField, MenuItem, useTheme, alpha, Box, Typography,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Alert,
} from '@mui/material';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFAvatar from '../../components/ui/UPFAvatar';
import UPFChip from '../../components/ui/UPFChip';
import UPFButton from '../../components/ui/UPFButton';
import UPFModal from '../../components/ui/UPFModal';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import type { CourseSummary } from '../../types';
import type { StudentProfileSummary } from '../../services/adminService';
import { getMyCourses, getCourseStudents, enrollStudentInMyCourse } from '../../services/professorService';
import { getStudents } from '../../services/adminService';

interface StudentWithCourse extends StudentProfileSummary {
  courseName: string;
  courseCode: string;
}

const ProfessorStudentsPage: React.FC = () => {
  const theme = useTheme();
  const [students, setStudents] = useState<StudentWithCourse[]>([]);
  const [allStudents, setAllStudents] = useState<StudentProfileSummary[]>([]);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState<string | 'ALL'>('ALL');

  // Modal enrôlement
  const [enrollModal, setEnrollModal] = useState<{ open: boolean; courseId: string | null; courseName: string }>({
    open: false, courseId: null, courseName: '',
  });
  const [enrollSearch, setEnrollSearch] = useState('');
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const myCourses = await getMyCourses();
      setCourses(myCourses);
      const allStudentsData: StudentWithCourse[] = [];
      for (const course of myCourses) {
        try {
          const studs = await getCourseStudents(String(course.id));
          studs.forEach((s) => allStudentsData.push({
            ...s,
            courseName: (course as any).title ?? (course as any).name ?? 'Cours',
            courseCode: course.code || '',
          }));
        } catch {
          /* Continuer sur les autres cours si un échoue */
        }
      }
      setStudents(allStudentsData);
    } catch {
      setCourses([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Charger tous les étudiants disponibles pour l'enrôlement
    getStudents().then(setAllStudents).catch(() => setAllStudents([]));
  }, []);

  const filtered = students
    .filter((s) => {
      if (filterCourse === 'ALL') return true;
      const course = courses.find((c) => c.id === filterCourse);
      return s.courseCode === course?.code;
    })
    .filter((s) => `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase()));

  const uniqueIds = new Set(students.map((s) => s.id));

  // Étudiants filtrés pour le modal d'enrôlement
  const enrollableStudents = allStudents.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(enrollSearch.toLowerCase())
  );

  const handleOpenEnrollModal = (courseId: string, courseName: string) => {
    setEnrollModal({ open: true, courseId, courseName });
    setEnrollSearch('');
    setEnrollSuccess(null);
    setEnrollError(null);
  };

  const handleEnrollStudent = async (studentId: string, studentName: string) => {
    if (!enrollModal.courseId) return;
    setEnrollLoading(true);
    setEnrollError(null);
    try {
      await enrollStudentInMyCourse(enrollModal.courseId, studentId);
      setEnrollSuccess(`${studentName} a été inscrit(e) avec succès dans ${enrollModal.courseName}.`);
      // Rafraîchir la liste
      await fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || "Erreur lors de l'inscription.";
      setEnrollError(msg);
    } finally {
      setEnrollLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PeopleRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>👨‍🎓 Mes étudiants</Typography>
            <Typography variant="body2" color="text.secondary">
              {uniqueIds.size} étudiant{uniqueIds.size > 1 ? 's' : ''} unique{uniqueIds.size > 1 ? 's' : ''} sur {courses.length} cours
            </Typography>
          </Box>
        </Box>
        {/* Bouton Inscrire par cours */}
        {filterCourse !== 'ALL' && (
          <UPFButton
            variant="contained"
            startIcon={<PersonAddRoundedIcon />}
            onClick={() => {
              const course = courses.find((c) => c.id === filterCourse);
              if (course) handleOpenEnrollModal(String(course.id), (course as any).title ?? course.code);
            }}
          >
            Inscrire un étudiant
          </UPFButton>
        )}
      </Box>

      {enrollSuccess && (
        <Alert severity="success" onClose={() => setEnrollSuccess(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {enrollSuccess}
        </Alert>
      )}

      {/* Filtres */}
      <UPFCard noHover sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <UPFSearchBar placeholder="Rechercher un étudiant…" value={search} onChange={setSearch} fullWidth />
          </Box>
          <TextField select size="small" label="Filtrer par cours" value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value === 'ALL' ? 'ALL' : e.target.value)}
            sx={{ minWidth: 220 }}>
            <MenuItem value="ALL">Tous les cours</MenuItem>
            {courses.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.code} — {(c as any).title ?? (c as any).name}
              </MenuItem>
            ))}
          </TextField>
          {filterCourse !== 'ALL' && (
            <UPFButton
              variant="outlined"
              size="small"
              startIcon={<PersonAddRoundedIcon />}
              onClick={() => {
                const course = courses.find((c) => c.id === filterCourse);
                if (course) handleOpenEnrollModal(String(course.id), (course as any).title ?? course.code);
              }}
            >
              Inscrire
            </UPFButton>
          )}
        </Box>
      </UPFCard>

      {/* Table */}
      <UPFCard noHover padding={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <TableCell sx={{ fontWeight: 600 }}>Étudiant</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Filière</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Année</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} sx={{ p: 3 }}>Chargement…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ p: 4, textAlign: 'center' }}>
                    {filterCourse !== 'ALL' ? (
                      <Box>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          Aucun étudiant inscrit dans ce cours.
                        </Typography>
                        <UPFButton
                          variant="outlined"
                          size="small"
                          startIcon={<PersonAddRoundedIcon />}
                          onClick={() => {
                            const course = courses.find((c) => c.id === filterCourse);
                            if (course) handleOpenEnrollModal(String(course.id), (course as any).title ?? course.code);
                          }}
                        >
                          Inscrire le premier étudiant
                        </UPFButton>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Aucun étudiant trouvé</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ) : filtered.map((s, idx) => (
                <TableRow key={`${s.id}-${s.courseCode}-${idx}`} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <UPFAvatar firstName={s.firstName} lastName={s.lastName} size="small" />
                      <Typography variant="body2" fontWeight={500}>{s.firstName} {s.lastName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{s.email}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{s.major ?? (s as any).filiere}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{s.currentYear ?? (s as any).annee}A</Typography></TableCell>
                  <TableCell><UPFChip label={s.courseCode} size="small" colorVariant="primary" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </UPFCard>

      {/* Modal d'inscription d'un étudiant */}
      <UPFModal
        open={enrollModal.open}
        onClose={() => setEnrollModal({ open: false, courseId: null, courseName: '' })}
        title={`Inscrire un étudiant — ${enrollModal.courseName}`}
        maxWidth="sm"
      >
        <Box>
          {enrollError && (
            <Alert severity="error" onClose={() => setEnrollError(null)} sx={{ mb: 2, borderRadius: 2 }}>
              {enrollError}
            </Alert>
          )}
          {enrollSuccess && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {enrollSuccess}
            </Alert>
          )}
          <UPFSearchBar
            placeholder="Rechercher un étudiant (nom, email)…"
            value={enrollSearch}
            onChange={setEnrollSearch}
            fullWidth
          />
          <Box sx={{ mt: 2, maxHeight: 350, overflow: 'auto' }}>
            {enrollableStudents.slice(0, 20).map((student) => (
              <Box
                key={student.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1.5,
                  px: 1,
                  borderRadius: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                }}
              >
                <UPFAvatar firstName={student.firstName} lastName={student.lastName} size="small" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {student.firstName} {student.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {student.email} · {student.major} · {student.currentYear}A
                  </Typography>
                </Box>
                <UPFButton
                  variant="outlined"
                  size="small"
                  loading={enrollLoading}
                  onClick={() => handleEnrollStudent(student.id, `${student.firstName} ${student.lastName}`)}
                >
                  Inscrire
                </UPFButton>
              </Box>
            ))}
            {enrollableStudents.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                Aucun étudiant trouvé
              </Typography>
            )}
          </Box>
        </Box>
      </UPFModal>
    </Box>
  );
};

export default ProfessorStudentsPage;
