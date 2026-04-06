/**
 * ProfessorCoursesPage — Liste des cours du professeur
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Skeleton, useTheme,
} from '@mui/material';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFChip from '../../components/ui/UPFChip';
import UPFButton from '../../components/ui/UPFButton';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import EmptyState from '../../components/common/EmptyState';
import type { CourseSummary } from '../../types';
import { getMyCourses } from '../../services/professorService';

const ProfessorCoursesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await getMyCourses();
        setCourses(data);
      } catch {
        setCourses([
          { id: '1', code: 'INF301', title: 'Algorithmique avancée', department: 'Génie Informatique', year: 3, semester: 5, professorName: 'Pr. Chraibi' } as unknown as CourseSummary,
          { id: '2', code: 'INF302', title: 'Programmation Web', department: 'Génie Informatique', year: 3, semester: 5, professorName: 'Pr. Chraibi' } as unknown as CourseSummary,
        ]);
      } finally { setLoading(false); }
    };
    fetchCourses();
  }, []);

  const filtered = courses.filter((c) => {
    const t = c.title ?? (c as any).name ?? '';
    const cod = c.code ?? '';
    return t.toLowerCase().includes(search.toLowerCase()) || cod.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={0.5}>📚 Mes cours</Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez vos cours, documents et étudiants
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <UPFSearchBar placeholder="Rechercher un cours…" value={search} onChange={setSearch} fullWidth />
      </Box>

      {loading ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6 }} key={i}>
              <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucun cours trouvé" description="Vous n'avez pas encore de cours assigné." icon={<MenuBookRoundedIcon />} />
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((course) => (
            <Grid size={{ xs: 12, sm: 6 }} key={course.id}>
              <UPFCard sx={{ cursor: 'pointer', height: '100%', position: 'relative', overflow: 'hidden' }}
                onClick={() => navigate(`/professor/courses/${course.id}`)}>
                <Box sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                  background: (course as any).isActive !== false
                    ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`
                    : theme.palette.divider,
                }} />

                <Box sx={{ display: 'flex', gap: 1, mb: 2, mt: 1 }}>
                  <UPFChip label={course.code || '—'} size="small" colorVariant="primary" />
                  <UPFChip label={(course as any).isActive !== false ? 'Actif' : 'Inactif'} size="small" colorVariant={(course as any).isActive !== false ? 'success' : 'error'} />
                </Box>

                <Typography variant="h6" fontWeight={600} mb={0.5}>{course.title ?? (course as any).name}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}
                  sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {(course as any).description}
                </Typography>

                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  {(course as any).department ?? (course as any).filiere} · {(course as any).year ?? (course as any).annee}ème année · Semestre {(course as any).semester ?? (course as any).semestre}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <UPFButton size="small" variant="outlined" startIcon={<PeopleRoundedIcon />}
                    onClick={(e) => { e.stopPropagation(); navigate(`/professor/courses/${course.id}`); }}>
                    Étudiants
                  </UPFButton>
                  <UPFButton size="small" variant="outlined" startIcon={<FolderRoundedIcon />}
                    onClick={(e) => { e.stopPropagation(); navigate(`/professor/courses/${course.id}/documents`); }}>
                    Documents
                  </UPFButton>
                </Box>
              </UPFCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ProfessorCoursesPage;
