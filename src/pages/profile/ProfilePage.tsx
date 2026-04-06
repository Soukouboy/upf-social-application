/**
 * ProfilePage — Profil public d'un étudiant
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Tabs, Tab, useTheme, alpha,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFAvatar from '../../components/ui/UPFAvatar';
import UPFChip from '../../components/ui/UPFChip';
import UPFButton from '../../components/ui/UPFButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';


const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState(0);

  // Si pas d'id dans l'URL → profil de l'utilisateur connecté
  const profile: any = user ? {
    ...user,
    bio: (user as any).bio || 'Étudiant passionné à l\'UPF Campus Rabat 🎓',
    competences: (user as any).competences || ['React', 'TypeScript', 'Java', 'Spring Boot'],
  } : null;

  const isOwnProfile = !id || String(id) === String(user?.id);

  if (!profile) return <LoadingSpinner fullPage />;

  return (
    <Box>
      {/* Bannière de profil */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          borderRadius: 4,
          p: 0,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Fond décoratif */}
        <Box sx={{ height: 140, position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', bgcolor: alpha('#fff', 0.05) }} />
          <Box sx={{ position: 'absolute', bottom: -20, left: '50%', width: 120, height: 120, borderRadius: '50%', bgcolor: alpha('#fff', 0.03) }} />
        </Box>

        {/* Info profil */}
        <Box sx={{ px: 4, pb: 3, mt: -6, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, flexWrap: 'wrap' }}>
            <UPFAvatar
              firstName={profile.firstName}
              lastName={profile.lastName}
              src={profile.avatarUrl}
              size="large"
              sx={{
                width: 96, height: 96, fontSize: '2rem',
                border: `4px solid ${theme.palette.background.paper}`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
            />
            <Box sx={{ flex: 1, color: '#fff', mb: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SchoolRoundedIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>{profile.filiere} — Année {profile.annee}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarTodayRoundedIcon sx={{ fontSize: 14, opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>Inscrit en {new Date(profile.createdAt).getFullYear()}</Typography>
                </Box>
              </Box>
            </Box>
            {isOwnProfile && (
              <UPFButton
                variant="contained"
                startIcon={<EditRoundedIcon />}
                onClick={() => navigate('/student/profile/edit')}
                sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.3), boxShadow: 'none' } }}
              >
                Modifier
              </UPFButton>
            )}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Colonne principale */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Bio */}
          <UPFCard noHover sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>À propos</Typography>
            <Typography variant="body1" color="text.secondary">{profile.bio}</Typography>
          </UPFCard>

          {/* Onglets d'activité */}
          <UPFCard noHover>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
              <Tab label="Épreuves partagées" icon={<DescriptionRoundedIcon />} iconPosition="start" sx={{ textTransform: 'none' }} />
              <Tab label="Groupes" icon={<GroupsRoundedIcon />} iconPosition="start" sx={{ textTransform: 'none' }} />
            </Tabs>
            {tab === 0 && (
              <Box>
                {[1, 2, 3].map((i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <DescriptionRoundedIcon sx={{ color: 'primary.main' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={500}>Examen Final — Matière {i}</Typography>
                      <Typography variant="caption" color="text.secondary">2024-2025 • 45 téléchargements</Typography>
                    </Box>
                    <UPFChip label="Final" size="small" colorVariant="error" />
                  </Box>
                ))}
              </Box>
            )}
            {tab === 1 && (
              <Box>
                {[1, 2].map((i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <GroupsRoundedIcon sx={{ color: 'info.main' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={500}>Groupe d'étude {i}</Typography>
                      <Typography variant="caption" color="text.secondary">12 membres • Public</Typography>
                    </Box>
                    <UPFChip label="Membre" size="small" colorVariant="info" />
                  </Box>
                ))}
              </Box>
            )}
          </UPFCard>
        </Grid>

        {/* Sidebar profil */}
        <Grid size={{ xs: 12, md: 4 }}>
          <UPFCard noHover sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Compétences</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {profile.competences?.map((c: string) => (
                <UPFChip key={c} label={c} size="small" colorVariant="primary" />
              ))}
            </Box>
          </UPFCard>

          <UPFCard noHover>
            <Typography variant="h6" fontWeight={600} mb={2}>Statistiques</Typography>
            {[
              { label: 'Épreuves partagées', value: 8 },
              { label: 'Groupes rejoints', value: 5 },
              { label: 'Téléchargements reçus', value: 234 },
            ].map((stat) => (
              <Box key={stat.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                <Typography variant="body2" fontWeight={600} color="primary.main">{stat.value}</Typography>
              </Box>
            ))}
          </UPFCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
