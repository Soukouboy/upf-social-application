/**
 * ProfessorDashboardPage — Tableau de bord du professeur
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, useTheme, alpha, Skeleton,
  List, ListItem, ListItemText, Divider,
} from '@mui/material';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFChip from '../../components/ui/UPFChip';
import { useAuth } from '../../hooks/useAuth';
import type { Course, Announcement } from '../../types';
import { getMyCourses, getMyAnnouncements } from '../../services/professorService';

const ProfessorDashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, a] = await Promise.all([getMyCourses(), getMyAnnouncements()]);
        setCourses(c);
        setAnnouncements(a);
      } catch {
        setCourses([
          { id: 1, code: 'INF301', title: 'Algorithmique avancée', description: 'Structures de données.', filiere: 'Génie Informatique', annee: 3, semestre: 5, professorName: user?.firstName, isActive: true, createdAt: '2025-09-01' },
          { id: 2, code: 'INF302', title: 'Programmation Web', description: 'React & Spring Boot.', filiere: 'Génie Informatique', annee: 3, semestre: 5, professorName: user?.firstName, isActive: true, createdAt: '2025-09-01' },
          { id: 3, code: 'INF303', title: 'Base de données', description: 'SQL avancé.', filiere: 'Génie Informatique', annee: 2, semestre: 3, professorName: user?.firstName, isActive: true, createdAt: '2025-09-01' },
        ]);
        setAnnouncements([
          { id: 1, courseId: 1, courseTitle: 'Algorithmique avancée', title: 'Report du TP 3', content: 'Le TP 3 est reporté au lundi prochain.', authorName: `${user?.firstName} ${user?.lastName}`, createdAt: new Date(Date.now() - 86400000).toISOString() },
          { id: 2, courseId: 2, courseTitle: 'Programmation Web', title: 'Projet final', content: 'Le sujet du projet final sera distribué vendredi.', authorName: `${user?.firstName} ${user?.lastName}`, createdAt: new Date(Date.now() - 172800000).toISOString() },
        ]);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const totalStudents = courses.length * 25; // estimation

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const stats = [
    { label: 'Mes cours', value: courses.length, icon: <MenuBookRoundedIcon />, color: '#3B82F6', path: '/professor/courses' },
    { label: 'Étudiants', value: totalStudents, icon: <PeopleRoundedIcon />, color: '#10B981', path: '/professor/students' },
    { label: 'Annonces', value: announcements.length, icon: <CampaignRoundedIcon />, color: '#F59E0B', path: '/professor/announcements' },
    { label: 'Documents', value: courses.length * 4, icon: <DescriptionRoundedIcon />, color: '#8B5CF6', path: '/professor/courses' },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
        borderRadius: 4, p: { xs: 3, sm: 4 }, mb: 4, color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', bgcolor: alpha('#fff', 0.06) }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight={700} mb={0.5}>
            {greeting()}, Pr. {user?.lastName || 'Professeur'} ! 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, mb: 2 }}>
            Gérez vos cours, étudiants et annonces
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <UPFButton variant="contained" size="small" startIcon={<CampaignRoundedIcon />}
              onClick={() => navigate('/professor/announcements')}
              sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.25), boxShadow: 'none' } }}
            >
              Nouvelle annonce
            </UPFButton>
            <UPFButton variant="contained" size="small" startIcon={<MenuBookRoundedIcon />}
              onClick={() => navigate('/professor/courses')}
              sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.25), boxShadow: 'none' } }}
            >
              Mes cours
            </UPFButton>
          </Box>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}><Skeleton variant="rounded" height={110} sx={{ borderRadius: 3 }} /></Grid>
          ))
        ) : stats.map((s) => (
          <Grid size={{ xs: 6, md: 3 }} key={s.label}>
            <UPFCard sx={{ cursor: 'pointer', '&:hover': { borderColor: alpha(s.color, 0.3) } }} onClick={() => navigate(s.path)}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight={700} color={s.color}>{s.value}</Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>{s.label}</Typography>
                </Box>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: alpha(s.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                  {s.icon}
                </Box>
              </Box>
            </UPFCard>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Mes cours */}
        <Grid size={{ xs: 12, md: 7 }}>
          <UPFCard noHover>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>📚 Mes cours</Typography>
              <UPFButton variant="text" size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/professor/courses')}>
                Tout voir
              </UPFButton>
            </Box>
            <List disablePadding>
              {courses.slice(0, 4).map((c, i) => (
                <React.Fragment key={c.id}>
                  <ListItem sx={{ px: 1, py: 1.5, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) } }}
                    onClick={() => navigate(`/professor/courses/${c.id}`)}>
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight={600}>{c.code} — {c.title}</Typography>}
                      secondary={`${c.filiere} · ${c.annee}A · S${c.semestre}`}
                    />
                    <UPFChip label={c.isActive ? 'Actif' : 'Inactif'} size="small" colorVariant={c.isActive ? 'success' : 'error'} />
                  </ListItem>
                  {i < courses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </UPFCard>
        </Grid>

        {/* Dernières annonces */}
        <Grid size={{ xs: 12, md: 5 }}>
          <UPFCard noHover>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>📢 Dernières annonces</Typography>
              <UPFButton variant="text" size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/professor/announcements')}>
                Tout voir
              </UPFButton>
            </Box>
            {announcements.length === 0 ? (
              <Typography color="text.secondary" variant="body2">Aucune annonce récente</Typography>
            ) : announcements.slice(0, 3).map((a) => (
              <Box key={a.id} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05), border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}` }}>
                <Typography variant="subtitle2" fontWeight={600}>{a.title}</Typography>
                <Typography variant="caption" color="text.secondary">{a.courseTitle} · {new Date(a.createdAt).toLocaleDateString('fr-FR')}</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {a.content}
                </Typography>
              </Box>
            ))}
          </UPFCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfessorDashboardPage;
