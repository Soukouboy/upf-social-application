/**
 * ProfessorCourseDetailPage — Détail d'un cours + liste des étudiants
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Breadcrumbs, Link, useTheme, alpha,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFChip from '../../components/ui/UPFChip';
import UPFAvatar from '../../components/ui/UPFAvatar';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { CourseSummary } from '../../types';
import type { StudentProfileSummary } from '../../services/professorService';
import { getMyCourses, getCourseStudents } from '../../services/professorService';

const ProfessorCourseDetailPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = id || '';

  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [students, setStudents] = useState<StudentProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!courseId) return;
      try {
        const [courses, studs] = await Promise.all([getMyCourses(), getCourseStudents(courseId)]);
        setCourse(courses.find((c) => String(c.id) === courseId) || null);
        setStudents(studs);
      } catch {
        // Fallback for mock environment
        setCourse({ id: courseId, code: 'INF301', title: 'Algorithmique avancée', department: 'Génie Informatique', year: 3, semester: 5, professorName: 'Pr. Chraibi' } as unknown as CourseSummary);
        setStudents([
          { id: '1', firstName: 'Amine', lastName: 'Benali', email: 'amine@upf.ac.ma', major: 'Génie Informatique', currentYear: 3 },
          { id: '2', firstName: 'Sarah', lastName: 'Alaoui', email: 'sarah@upf.ac.ma', major: 'Génie Informatique', currentYear: 3 },
        ]);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [courseId]);

  if (loading) return <LoadingSpinner fullPage message="Chargement…" />;
  if (!course) return null;

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/professor/courses')}><ArrowBackRoundedIcon /></IconButton>
        <Breadcrumbs>
          <Link component="button" variant="body2" onClick={() => navigate('/professor/courses')} underline="hover" color="text.secondary">Mes cours</Link>
          <Typography variant="body2" color="text.primary" fontWeight={500}>{course.title}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Header du cours */}
      <Box sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
        borderRadius: 4, p: 4, mb: 4, color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', bgcolor: alpha('#fff', 0.05) }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <UPFChip label={course.code || '—'} sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff' }} />
            <UPFChip label={`S${(course as any).semester ?? (course as any).semestre}`} sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff' }} />
          </Box>
          <Typography variant="h4" fontWeight={700} mb={1}>{course.title ?? (course as any).name}</Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, mb: 2 }}>{(course as any).description}</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <UPFButton variant="contained" startIcon={<FolderRoundedIcon />}
              onClick={() => navigate(`/professor/courses/${course.id}/documents`)}
              sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.3), boxShadow: 'none' } }}>
              Documents
            </UPFButton>
          </Box>
        </Box>
      </Box>

      {/* Liste des étudiants */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleRoundedIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={600}>Étudiants inscrits ({students.length})</Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <UPFSearchBar placeholder="Rechercher un étudiant…" value={search} onChange={setSearch} fullWidth />
      </Box>

      <UPFCard noHover padding={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <TableCell sx={{ fontWeight: 600 }}>Étudiant</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Filière</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Année</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <UPFAvatar firstName={s.firstName} lastName={s.lastName} size="small" />
                      <Typography variant="body2" fontWeight={500}>{s.firstName} {s.lastName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{s.email}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{s.major}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{s.currentYear}ème année</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </UPFCard>
    </Box>
  );
};

export default ProfessorCourseDetailPage;
