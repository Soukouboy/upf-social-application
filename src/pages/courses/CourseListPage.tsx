/**
 * CourseListPage — Liste des cours avec filtres
 *
 * Filtrage par filière, année, semestre.
 * Barre de recherche et pagination.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  MenuItem,
  TextField,
  Pagination,
  Skeleton,
  Chip,
} from '@mui/material';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import UPFChip from '../../components/ui/UPFChip';
import UPFButton from '../../components/ui/UPFButton';
import EmptyState from '../../components/common/EmptyState';
import type { CourseDetails, CourseFilters } from '../../types';
import { getCourses } from '../../services/courseService';

const FILIERES = ['Toutes', 'Informatique', 'Gestion', 'Finance', 'Marketing', 'Droit'];
const SEMESTRES = [0, 1, 2]; // 0 = tous

const CourseListPage: React.FC = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<CourseDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filiere, setFiliere] = useState('Toutes');
  const [semestre, setSemestre] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const filters: CourseFilters = {
          page: page - 1,
          size: 12,
          search: search || undefined,
          major: filiere !== 'Toutes' ? filiere : undefined,
          semester: semestre || undefined,
        };
        const result = await getCourses(filters);
        setCourses(result.content);
        setTotalPages(result.totalPages);
      } catch {
        // En mode démo, utiliser des données fictives
        // setCourses(MOCK_COURSES);
        setTotalPages(2);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [page, search, filiere, semestre]);

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={0.5}>
          📚 Cours
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explorez tous les cours disponibles pour votre filière
        </Typography>
      </Box>

      {/* Filtres */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 4,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <UPFSearchBar
          placeholder="Rechercher un cours…"
          value={search}
          onChange={setSearch}
          fullWidth
        />
        <TextField
          select
          size="small"
          label="Filière"
          value={filiere}
          onChange={(e) => setFiliere(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {FILIERES.map((f) => (
            <MenuItem key={f} value={f}>{f}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Semestre"
          value={semestre}
          onChange={(e) => setSemestre(Number(e.target.value))}
          sx={{ minWidth: 130 }}
        >
          <MenuItem value={0}>Tous</MenuItem>
          {SEMESTRES.filter((s) => s > 0).map((s) => (
            <MenuItem key={s} value={s}>Semestre {s}</MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Grille de cours */}
      {loading ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
              <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : courses.length === 0 ? (
        <EmptyState
          title="Aucun cours trouvé"
          description="Essayez de modifier vos filtres de recherche"
          icon={<MenuBookRoundedIcon />}
        />
      ) : (
        <>
          <Grid container spacing={2.5}>
            {courses.map((course) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={course.id}>
                <UPFCard
                  sx={{ cursor: 'pointer', height: '100%' }}
                  onClick={() => navigate(`/student/courses/${course.id}`)}
                >
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <UPFChip label={course.major} size="small" colorVariant="primary" />
                    <Chip
                      label={`S${course.semester}`}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 50, fontSize: '0.7rem' }}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={600} mb={1} noWrap>
                    {course.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={2}
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.objectives}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {course.professorName && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {course.professorName}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Année {course.year}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <UPFButton
                      size="small"
                      variant="text"
                      endIcon={<ArrowForwardRoundedIcon />}
                      sx={{ color: 'primary.main' }}
                    >
                      Voir le cours
                    </UPFButton>
                  </Box>
                </UPFCard>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
              shape="rounded"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

// // Données fictives pour la démo
// const MOCK_COURSES: Course[] = [
//   {
//     id: 1, title: 'Algorithmique et Structures de Données', description: 'Étude des algorithmes fondamentaux : tri, recherche, graphes. Analyse de complexité et structures de données avancées.',
//     major: 'Informatique', annee: 2, semestre: 1, professorName: 'Prof. Ahmed', isActive: true, createdAt: '2025-09-01',
//   },
//   {
//     id: 2, title: 'Base de Données Avancées', description: 'SQL avancé, optimisation de requêtes, NoSQL, transactions distribuées et réplication.',
//     major: 'Informatique', annee: 3, semestre: 1, professorName: 'Prof. Fatima', isActive: true, createdAt: '2025-09-01',
//   },
//   {
//     id: 3, title: 'Développement Web Full Stack', description: 'React, Node.js, REST API, authentification JWT, déploiement cloud.',
//     major: 'Informatique', annee: 3, semestre: 2, professorName: 'Prof. Karim', isActive: true, createdAt: '2025-09-01',
//   },
//   {
//     id: 4, title: 'Comptabilité Analytique', description: 'Méthodes de calcul des coûts, budgets prévisionnels, contrôle de gestion.',
//     major: 'Gestion', annee: 2, semestre: 1, professorName: 'Prof. Nadia', isActive: true, createdAt: '2025-09-01',
//   },
//   {
//     id: 5, title: 'Marketing Digital', description: 'SEO, SEA, réseaux sociaux, content marketing, analytics et KPIs.',
//     major: 'Marketing', annee: 2, semestre: 2, professorName: 'Prof. Hassan', isActive: true, createdAt: '2025-09-01',
//   },
//   {
//     id: 6, title: 'Droit des Affaires', description: 'Contrats commerciaux, droit des sociétés, propriété intellectuelle.',
//     major: 'Droit', annee: 3, semestre: 1, professorName: 'Prof. Salma', isActive: true, createdAt: '2025-09-01',
//   },
// ];

export default CourseListPage;
