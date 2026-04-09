/**
 * DashboardPage — Page d'accueil après connexion (Student)
 *
 * Données dynamiques :
 *   - Stats : cours inscrits, épreuves partagées, groupes, contributions
 *   - Activité récente : dernières annonces des cours
 *   - Top contributeurs : à partir du réseau
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  useTheme,
  alpha,
  Skeleton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFAvatar from '../../components/ui/UPFAvatar';
import UPFChip from '../../components/ui/UPFChip';
import { useAuth } from '../../hooks/useAuth';
import { getMyCourses as getMyStudentCourses } from '../../services/courseService';
import { getMyGroups } from '../../services/groupService';
import { getMyExams } from '../../services/examService';
import type { CourseSummary, AnnouncementResponse, GroupSummary, ExamSummary } from '../../types';

const QUICK_ACTIONS = [
  {
    label: 'Déposer une épreuve',
    icon: <DescriptionRoundedIcon />,
    path: '/student/exams/upload',
    color: '#10B981',
  },
  {
    label: 'Créer un groupe',
    icon: <GroupsRoundedIcon />,
    path: '/student/groups/create',
    color: '#3B82F6',
  },
  {
    label: 'Explorer les cours',
    icon: <MenuBookRoundedIcon />,
    path: '/student/courses',
    color: '#F59E0B',
  },
];

interface DashboardStats {
  coursesCount: number;
  examsCount: number;
  groupsCount: number;
  contributions: number;
}

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAnnouncements, setRecentAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [recentGroups, setRecentGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [coursesData, groupsData, examsData] = await Promise.allSettled([
          getMyStudentCourses(),
          getMyGroups(),
          getMyExams(),
        ]);

        const courses = coursesData.status === 'fulfilled' ? coursesData.value : [];
        const groups = groupsData.status === 'fulfilled' ? groupsData.value : [];
        const exams = examsData.status === 'fulfilled' ? examsData.value : [];

        // Extraire les annonces des cours récents
        const announcements: AnnouncementResponse[] = [];
        if (coursesData.status === 'fulfilled') {
          coursesData.value.forEach((course: any) => {
            if (course.announcements) {
              course.announcements.slice(0, 2).forEach((a: AnnouncementResponse) => {
                announcements.push(a);
              });
            }
          });
        }

        setStats({
          coursesCount: courses.length,
          examsCount: Array.isArray(exams) ? exams.length : (exams as any)?.totalElements ?? 0,
          groupsCount: groups.length,
          contributions: Array.isArray(exams) ? exams.length : (exams as any)?.totalElements ?? 0,
        });

        setRecentAnnouncements(announcements.slice(0, 4));
        setRecentGroups((groups as any[]).slice(0, 3) as GroupSummary[]);
      } catch {
        // Fallback silencieux : afficher des zéros
        setStats({ coursesCount: 0, examsCount: 0, groupsCount: 0, contributions: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const statCards = stats ? [
    {
      label: 'Mes cours',
      value: stats.coursesCount,
      icon: <MenuBookRoundedIcon />,
      color: '#3B82F6',
      path: '/student/courses',
    },
    {
      label: 'Épreuves partagées',
      value: stats.examsCount,
      icon: <DescriptionRoundedIcon />,
      color: '#10B981',
      path: '/student/exams',
    },
    {
      label: 'Mes groupes',
      value: stats.groupsCount,
      icon: <GroupsRoundedIcon />,
      color: '#F59E0B',
      path: '/student/groups',
    },
    {
      label: 'Contributions',
      value: stats.contributions,
      icon: <TrendingUpRoundedIcon />,
      color: '#8B5CF6',
      path: '/student/profile',
    },
  ] : [];

  return (
    <Box>
      {/* ────────── Carte de bienvenue ────────── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          borderRadius: 4,
          p: { xs: 3, sm: 4 },
          mb: 4,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Décoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: alpha('#fff', 0.06),
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -20,
            right: 80,
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: alpha('#fff', 0.04),
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight={700} mb={0.5}>
            {greeting()}, {user?.firstName || 'étudiant'} ! 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, mb: 2 }}>
            Voici un résumé de votre activité sur UPF Social
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {QUICK_ACTIONS.map((action) => (
              <UPFButton
                key={action.label}
                variant="contained"
                size="small"
                startIcon={action.icon}
                onClick={() => navigate(action.path)}
                sx={{
                  bgcolor: alpha('#fff', 0.15),
                  color: '#fff',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.25),
                    boxShadow: 'none',
                  },
                }}
              >
                {action.label}
              </UPFButton>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ────────── Stats rapides ────────── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid size={{ xs: 6, md: 3 }} key={i}>
                <Skeleton variant="rounded" height={110} sx={{ borderRadius: 3 }} />
              </Grid>
            ))
          : statCards.map((stat) => (
              <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
                <UPFCard
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: alpha(stat.color, 0.3),
                    },
                  }}
                  onClick={() => navigate(stat.path)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" fontWeight={700} color={stat.color}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {stat.label}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        bgcolor: alpha(stat.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                </UPFCard>
              </Grid>
            ))}
      </Grid>

      {/* ────────── Contenu principal (2 colonnes) ────────── */}
      <Grid container spacing={3}>
        {/* Annonces récentes */}
        <Grid size={{ xs: 12, md: 8 }}>
          <UPFCard noHover>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsActiveRoundedIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Annonces récentes
                </Typography>
              </Box>
              <UPFButton
                variant="text"
                size="small"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => navigate('/student/courses')}
              >
                Mes cours
              </UPFButton>
            </Box>

            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, py: 1.5 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="40%" height={12} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              ))
            ) : recentAnnouncements.length > 0 ? (
              <List disablePadding>
                {recentAnnouncements.map((ann, index) => (
                  <React.Fragment key={ann.id}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        px: 1,
                        py: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                      }}
                    >
                      <ListItemAvatar>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.palette.warning.main,
                          }}
                        >
                          <CampaignRoundedIcon fontSize="small" />
                        </Box>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            <strong>{ann.title}</strong>
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {ann.course?.title ?? 'Cours'} · {ann.professor ? `${ann.professor.firstName ?? ''} ${ann.professor.lastName ?? ''}`.trim() : ''} · {new Date(ann.createdAt).toLocaleDateString('fr-FR')}
                          </Typography>
                        }
                      />
                      <UPFChip label="Annonce" size="small" colorVariant="secondary" />
                    </ListItem>
                    {index < recentAnnouncements.length - 1 && <Divider variant="inset" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CampaignRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Aucune annonce récente.{' '}
                  <Box
                    component="span"
                    sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => navigate('/student/courses')}
                  >
                    Consultez vos cours
                  </Box>
                </Typography>
              </Box>
            )}
          </UPFCard>
        </Grid>

        {/* Panneau latéral */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Mes groupes récents */}
          <UPFCard noHover sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EmojiEventsRoundedIcon sx={{ color: theme.palette.secondary.main }} />
              <Typography variant="h6" fontWeight={600}>
                Mes groupes récents
              </Typography>
            </Box>
            {loading ? (
              [1, 2, 3].map((i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="70%" height={16} />
                    <Skeleton width="40%" height={12} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              ))
            ) : recentGroups.length > 0 ? (
              <>
                {recentGroups.map((group: any) => (
                  <Box
                    key={group.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1,
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 },
                    }}
                    onClick={() => navigate(`/student/groups/${group.id}`)}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.palette.primary.main,
                        flexShrink: 0,
                      }}
                    >
                      <GroupsRoundedIcon fontSize="small" />
                    </Box>
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        noWrap
                      >
                        {group.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {group.memberCount ?? 0} membre{(group.memberCount ?? 0) > 1 ? 's' : ''} · {group.type === 'PUBLIC' ? 'Public' : 'Privé'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                <UPFButton
                  variant="text"
                  size="small"
                  endIcon={<ArrowForwardRoundedIcon />}
                  onClick={() => navigate('/student/groups')}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  Tous mes groupes
                </UPFButton>
              </>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Vous n'avez pas encore rejoint de groupe.
                </Typography>
                <UPFButton
                  variant="outlined"
                  size="small"
                  startIcon={<GroupsRoundedIcon />}
                  onClick={() => navigate('/student/groups')}
                >
                  Explorer les groupes
                </UPFButton>
              </Box>
            )}
          </UPFCard>

          {/* Liens rapides */}
          <UPFCard noHover>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Accès rapides
            </Typography>
            {[
              { label: 'Mes cours', path: '/student/courses', icon: <MenuBookRoundedIcon />, color: '#3B82F6' },
              { label: 'Épreuves', path: '/student/exams', icon: <DescriptionRoundedIcon />, color: '#10B981' },
              { label: 'Réseau étudiant', path: '/student/network', icon: <GroupsRoundedIcon />, color: '#8B5CF6' },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1.2,
                  px: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: alpha(item.color, 0.06) },
                }}
                onClick={() => navigate(item.path)}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: alpha(item.color, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
                  {item.label}
                </Typography>
                <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              </Box>
            ))}
          </UPFCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
