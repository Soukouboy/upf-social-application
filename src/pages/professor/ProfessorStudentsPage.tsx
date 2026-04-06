/**
 * ProfessorStudentsPage — Liste de tous les étudiants du professeur (tous cours confondus)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField, MenuItem, useTheme, alpha, Box, Typography,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFAvatar from '../../components/ui/UPFAvatar';
import UPFChip from '../../components/ui/UPFChip';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import type { CourseSummary } from '../../types';
import type { StudentProfileSummary } from '../../services/adminService'; // Note: getCourseStudents returns StudentProfileSummary
import { getMyCourses, getCourseStudents } from '../../services/professorService';

interface StudentWithCourse extends StudentProfileSummary {
  courseName: string;
  courseCode: string;
}

const ProfessorStudentsPage: React.FC = () => {
  const theme = useTheme();
  const [students, setStudents] = useState<StudentWithCourse[]>([]);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState<string | 'ALL'>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const myCourses = await getMyCourses();
        setCourses(myCourses);
        const allStudents: StudentWithCourse[] = [];
        for (const course of myCourses) {
          const studs = await getCourseStudents(String(course.id));
          studs.forEach((s) => allStudents.push({ ...s, courseName: course.title ?? (course as any).name, courseCode: course.code || '' }));
        }
        setStudents(allStudents);
      } catch {
        // Fallback pour dev
        setCourses([
          { id: '1', code: 'INF301', title: 'Algorithmique avancée', department: 'Génie Informatique', year: 3, semester: 5, professorName: 'Pr.' } as unknown as CourseSummary
        ]);
        setStudents([
          { id: '1', firstName: 'Amine', lastName: 'Benali', email: 'amine@upf.ac.ma', major: 'Génie Informatique', currentYear: 3, courseName: 'Algorithmique', courseCode: 'INF301' } as StudentWithCourse
        ]);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const filtered = students
    .filter((s) => filterCourse === 'ALL' || s.courseCode === courses.find((c) => c.id === filterCourse)?.code)
    .filter((s) => `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase()));

  // Unique students count
  const uniqueIds = new Set(students.map((s) => s.id));

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <PeopleRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={700}>👨‍🎓 Mes étudiants</Typography>
          <Typography variant="body2" color="text.secondary">
            {uniqueIds.size} étudiant{uniqueIds.size > 1 ? 's' : ''} unique{uniqueIds.size > 1 ? 's' : ''} sur {courses.length} cours
          </Typography>
        </Box>
      </Box>

      <UPFCard noHover sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <UPFSearchBar placeholder="Rechercher un étudiant…" value={search} onChange={setSearch} fullWidth />
          </Box>
          <TextField select size="small" label="Filtrer par cours" value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value === 'ALL' ? 'ALL' : e.target.value)} sx={{ minWidth: 220 }}>
            <MenuItem value="ALL">Tous les cours</MenuItem>
            {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.code} — {c.title ?? (c as any).name}</MenuItem>)}
          </TextField>
        </Box>
      </UPFCard>

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
                <TableRow><TableCell colSpan={5} sx={{ p: 4, textAlign: 'center' }}>Aucun étudiant trouvé</TableCell></TableRow>
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
    </Box>
  );
};

export default ProfessorStudentsPage;
