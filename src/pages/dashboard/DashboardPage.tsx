/**
 * DashboardPage — Page d'accueil après connexion
 *
 * Affiche :
 *   - Carte de bienvenue avec nom de l'utilisateur
 *   - Stats rapides (cours, épreuves, groupes)
 *   - Raccourcis vers les sections principales
 *   - Fil d'activité récente
 */
import React from 'react';
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
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFAvatar from '../../components/ui/UPFAvatar';
import UPFChip from '../../components/ui/UPFChip';
import { useAuth } from '../../hooks/useAuth';

// Données fictives pour la démo (seront remplacées par des appels API)
const MOCK_STATS = [
  {
    label: 'Mes cours',
    value: 12,
    icon: <MenuBookRoundedIcon />,
    color: '#3B82F6',
    path: '/courses',
  },
  {
    label: 'Épreuves partagées',
    value: 8,
    icon: <DescriptionRoundedIcon />,
    color: '#10B981',
    path: '/exams',
  },
  {
    label: 'Mes groupes',
    value: 5,
    icon: <GroupsRoundedIcon />,
    color: '#F59E0B',
    path: '/groups',
  },
  {
    label: 'Contributions',
    value: 23,
    icon: <TrendingUpRoundedIcon />,
    color: '#8B5CF6',
    path: '/profile',
  },
];

const MOCK_ACTIVITIES = [
  {
    id: 1,
    user: 'Amina B.',
    action: 'a partagé une épreuve de',
    target: 'Algorithmique — Final 2025',
    time: 'Il y a 15 min',
    type: 'EXAM_SHARED' as const,
  },
  {
    id: 2,
    user: 'Youssef K.',
    action: 'a rejoint le groupe',
    target: 'Dev Web S4',
    time: 'Il y a 1h',
    type: 'GROUP_JOINED' as const,
  },
  {
    id: 3,
    user: 'Prof. Ahmed',
    action: 'a ajouté une ressource dans',
    target: 'Base de données avancées',
    time: 'Il y a 2h',
    type: 'COURSE_VIEWED' as const,
  },
  {
    id: 4,
    user: 'Sara M.',
    action: 'a commenté sur',
    target: 'Partiel Maths Discrètes 2024',
    time: 'Il y a 3h',
    type: 'COMMENT_POSTED' as const,
  },
];

const QUICK_ACTIONS = [
  {
    label: 'Déposer une épreuve',
    icon: <DescriptionRoundedIcon />,
    path: '/exams/upload',
    color: '#10B981',
  },
  {
    label: 'Créer un groupe',
    icon: <GroupsRoundedIcon />,
    path: '/groups',
    color: '#3B82F6',
  },
  {
    label: 'Explorer les cours',
    icon: <MenuBookRoundedIcon />,
    path: '/courses',
    color: '#F59E0B',
  },
];

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

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
        {MOCK_STATS.map((stat) => (
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
        {/* Fil d'activité */}
        <Grid size={{ xs: 12, md: 8 }}>
          <UPFCard noHover>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsActiveRoundedIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Activité récente
                </Typography>
              </Box>
              <UPFButton
                variant="text"
                size="small"
                endIcon={<ArrowForwardRoundedIcon />}
              >
                Tout voir
              </UPFButton>
            </Box>

            <List disablePadding>
              {MOCK_ACTIVITIES.map((activity, index) => (
                <React.Fragment key={activity.id}>
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
                      <UPFAvatar
                        firstName={activity.user.split(' ')[0]}
                        lastName={activity.user.split(' ')[1] || ''}
                        size="small"
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          <strong>{activity.user}</strong> {activity.action}{' '}
                          <strong>{activity.target}</strong>
                        </Typography>
                      }
                      secondary={activity.time}
                    />
                    <UPFChip
                      label={
                        activity.type === 'EXAM_SHARED'
                          ? 'Épreuve'
                          : activity.type === 'GROUP_JOINED'
                          ? 'Groupe'
                          : activity.type === 'COURSE_VIEWED'
                          ? 'Cours'
                          : 'Commentaire'
                      }
                      size="small"
                      colorVariant={
                        activity.type === 'EXAM_SHARED'
                          ? 'success'
                          : activity.type === 'GROUP_JOINED'
                          ? 'info'
                          : activity.type === 'COURSE_VIEWED'
                          ? 'secondary'
                          : 'primary'
                      }
                    />
                  </ListItem>
                  {index < MOCK_ACTIVITIES.length - 1 && <Divider variant="inset" />}
                </React.Fragment>
              ))}
            </List>
          </UPFCard>
        </Grid>

        {/* Panneau latéral */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Top contributeurs */}
          <UPFCard noHover sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EmojiEventsRoundedIcon sx={{ color: theme.palette.secondary.main }} />
              <Typography variant="h6" fontWeight={600}>
                Top contributeurs
              </Typography>
            </Box>
            {[
              { name: 'Amina B.', points: 156, rank: 1 },
              { name: 'Youssef K.', points: 132, rank: 2 },
              { name: 'Sara M.', points: 98, rank: 3 },
            ].map((contributor) => (
              <Box
                key={contributor.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor:
                      contributor.rank === 1
                        ? theme.palette.secondary.main
                        : contributor.rank === 2
                        ? '#C0C0C0'
                        : '#CD7F32',
                    color: contributor.rank === 1 ? theme.palette.primary.main : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                  }}
                >
                  {contributor.rank}
                </Typography>
                <UPFAvatar
                  firstName={contributor.name.split(' ')[0]}
                  lastName={contributor.name.split(' ')[1]}
                  size="small"
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {contributor.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {contributor.points} pts
                  </Typography>
                </Box>
              </Box>
            ))}
          </UPFCard>

          {/* Skeleton pour contenu futur */}
          <UPFCard noHover>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Mes groupes récents
            </Typography>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Skeleton variant="circular" width={36} height={36} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="70%" height={16} />
                  <Skeleton width="40%" height={12} sx={{ mt: 0.5 }} />
                </Box>
              </Box>
            ))}
          </UPFCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
