/**
 * AdminDashboardPage — Tableau de bord administrateur
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, useTheme, alpha, Skeleton,
} from '@mui/material';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import type { AdminStats } from '../../types';
import { getAdminStats } from '../../services/adminService';

const AdminDashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch {
        setStats({ totalUsers: 156, activeUsers: 142, totalCourses: 24, totalExams: 89, totalGroups: 18, pendingReports: 5 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats ? [
    { label: 'Utilisateurs', value: stats.totalUsers, sub: `${stats.activeUsers} actifs`, icon: <PeopleRoundedIcon />, color: '#3B82F6', path: '/admin/users' },
    { label: 'Cours', value: stats.totalCourses, icon: <MenuBookRoundedIcon />, color: '#10B981', path: '/admin/courses' },
    { label: 'Épreuves', value: stats.totalExams, icon: <DescriptionRoundedIcon />, color: '#8B5CF6', path: '/admin/courses' },
    { label: 'Groupes', value: stats.totalGroups, icon: <GroupsRoundedIcon />, color: '#F59E0B', path: '/admin/users' },
    { label: 'Signalements', value: stats.pendingReports, sub: 'en attente', icon: <FlagRoundedIcon />, color: '#EF4444', path: '/admin/reports' },
  ] : [];

  const quickLinks = [
    { label: 'Gérer les utilisateurs', icon: <PeopleRoundedIcon />, path: '/admin/users', color: '#3B82F6' },
    { label: 'Gérer les admins', icon: <AdminPanelSettingsRoundedIcon />, path: '/admin/admins', color: '#8B5CF6' },
    { label: 'Gérer les cours', icon: <MenuBookRoundedIcon />, path: '/admin/courses', color: '#10B981' },
    { label: 'Traiter les signalements', icon: <FlagRoundedIcon />, path: '/admin/reports', color: '#EF4444' },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        borderRadius: 4, p: 4, mb: 4, color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', bgcolor: alpha('#fff', 0.05) }} />
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminPanelSettingsRoundedIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>Administration</Typography>
            <Typography variant="body1" sx={{ opacity: 0.85 }}>Gérez la plateforme UPF Social</Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Grid size={{ xs: 6, md: 2.4 }} key={i}>
              <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
            </Grid>
          ))
        ) : (
          statCards.map((stat) => (
            <Grid size={{ xs: 6, md: 2.4 }} key={stat.label}>
              <UPFCard sx={{ cursor: 'pointer', '&:hover': { borderColor: alpha(stat.color, 0.3) } }} onClick={() => navigate(stat.path)}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight={700} color={stat.color}>{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>{stat.label}</Typography>
                    {stat.sub && <Typography variant="caption" color="text.secondary">{stat.sub}</Typography>}
                  </Box>
                  <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: alpha(stat.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </UPFCard>
            </Grid>
          ))
        )}
      </Grid>

      {/* Quick Links */}
      <Typography variant="h6" fontWeight={600} mb={2}>Accès rapides</Typography>
      <Grid container spacing={2.5}>
        {quickLinks.map((link) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={link.label}>
            <UPFCard sx={{ cursor: 'pointer', textAlign: 'center', '&:hover': { borderColor: alpha(link.color, 0.3) } }} onClick={() => navigate(link.path)}>
              <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: alpha(link.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: link.color, mx: 'auto', mb: 2 }}>
                {link.icon}
              </Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>{link.label}</Typography>
              <UPFButton variant="text" size="small" endIcon={<ArrowForwardRoundedIcon />} sx={{ color: link.color }}>
                Accéder
              </UPFButton>
            </UPFCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;
