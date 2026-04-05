/**
 * CourseDetailPage — Détail d'un cours
 *
 * Affiche description, objectifs, prérequis et ressources associées.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  alpha,
  Breadcrumbs,
  Link,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFChip from '../../components/ui/UPFChip';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Course, CourseResource } from '../../types';
import { getCourseById, getCourseResources } from '../../services/courseService';

const resourceIcons: Record<string, React.ReactNode> = {
  PDF: <PictureAsPdfRoundedIcon sx={{ color: '#EF4444' }} />,
  VIDEO: <VideoLibraryRoundedIcon sx={{ color: '#3B82F6' }} />,
  LINK: <LinkRoundedIcon sx={{ color: '#10B981' }} />,
  DOCUMENT: <PictureAsPdfRoundedIcon sx={{ color: '#F59E0B' }} />,
};

const CourseDetailPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [courseData, resourcesData] = await Promise.all([
          getCourseById(Number(id)),
          getCourseResources(Number(id)),
        ]);
        setCourse(courseData);
        setResources(resourcesData);
      } catch {
        // Données fictives pour la démo
        setCourse({
          id: Number(id),
          title: 'Algorithmique et Structures de Données',
          description: 'Ce cours approfondit les algorithmes fondamentaux et les structures de données essentielles en informatique. Les étudiants apprendront à analyser la complexité des algorithmes et à choisir les structures de données appropriées pour résoudre différents types de problèmes.',
          objectives: [
            'Maîtriser les algorithmes de tri et de recherche',
            'Comprendre les structures de données arborescentes',
            'Analyser la complexité temporelle et spatiale',
            'Implémenter des algorithmes sur les graphes',
          ],
          prerequisites: [
            'Introduction à la programmation (Java ou Python)',
            'Mathématiques discrètes',
          ],
          filiere: 'Informatique',
          annee: 2,
          semestre: 1,
          professorName: 'Prof. Ahmed',
          createdAt: '2025-09-01',
        });
        setResources([
          { id: 1, courseId: Number(id), title: 'Cours - Chapitre 1 : Complexité', type: 'PDF', url: '#', sizeBytes: 2400000, downloadCount: 15 },
          { id: 2, courseId: Number(id), title: 'TP - Arbres binaires', type: 'PDF', url: '#', sizeBytes: 1200000, downloadCount: 8 },
          { id: 3, courseId: Number(id), title: 'Vidéo - Algorithmes de tri', type: 'VIDEO', url: '#', downloadCount: 42 },
          { id: 4, courseId: Number(id), title: 'Références externes', type: 'LINK', url: '#', downloadCount: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage message="Chargement du cours..." />;
  if (!course) return null;

  return (
    <Box>
      {/* Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/courses')}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Breadcrumbs>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/courses')}
            underline="hover"
            color="text.secondary"
          >
            Cours
          </Link>
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            {course.title}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* En-tête du cours */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', bgcolor: alpha('#fff', 0.05) }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <UPFChip label={course.filiere} sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff' }} />
            <UPFChip label={`Année ${course.annee} — S${course.semestre}`} sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff' }} />
          </Box>
          <Typography variant="h4" fontWeight={700} mb={1}>
            {course.title}
          </Typography>
          {course.professorName && (
            <Typography variant="body1" sx={{ opacity: 0.85 }}>
              👨‍🏫 {course.professorName}
            </Typography>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Colonne principale */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Description */}
          <UPFCard noHover sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
              {course.description}
            </Typography>
          </UPFCard>

          {/* Objectifs */}
          {course.objectives && course.objectives.length > 0 && (
            <UPFCard noHover sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                🎯 Objectifs du cours
              </Typography>
              <List disablePadding>
                {course.objectives.map((obj, i) => (
                  <ListItem key={i} disablePadding sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleRoundedIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={obj} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>
            </UPFCard>
          )}

          {/* Prérequis */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <UPFCard noHover>
              <Typography variant="h6" fontWeight={600} mb={2}>
                ⚠️ Prérequis
              </Typography>
              <List disablePadding>
                {course.prerequisites.map((pre, i) => (
                  <ListItem key={i} disablePadding sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <WarningRoundedIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={pre} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>
            </UPFCard>
          )}
        </Grid>

        {/* Ressources */}
        <Grid size={{ xs: 12, md: 4 }}>
          <UPFCard noHover>
            <Typography variant="h6" fontWeight={600} mb={2}>
              📁 Ressources ({resources.length})
            </Typography>
            <List disablePadding>
              {resources.map((resource) => (
                <ListItem
                  key={resource.id}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                  secondaryAction={
                    <IconButton edge="end" size="small">
                      <DownloadRoundedIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {resourceIcons[resource.type] || <PictureAsPdfRoundedIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={resource.title}
                    secondary={resource.sizeBytes ? `${(resource.sizeBytes / 1024 / 1024).toFixed(1)} Mo` : resource.type}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </UPFCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseDetailPage;
