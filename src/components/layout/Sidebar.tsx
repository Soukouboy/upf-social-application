/**
 * Sidebar — Navigation principale (role-aware)
 *
 * Affiche les nav items en fonction du rôle de l'utilisateur :
 *   STUDENT   : Dashboard, Cours, Épreuves, Groupes, Messages, Réseau, Profil
 *   PROFESSOR : Dashboard, Mes cours, Mes étudiants, Documents, Annonces, Profil
 *   ADMIN     : Dashboard, Utilisateurs, Admins, Cours, Signalements
 */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  useMediaQuery,
  alpha,
  Divider,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types';

export const SIDEBAR_WIDTH = 260;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const studentNav: NavItem[] = [
  { label: 'Dashboard', path: '/student/dashboard', icon: <DashboardRoundedIcon /> },
  { label: 'Cours', path: '/student/courses', icon: <MenuBookRoundedIcon /> },
  { label: 'Épreuves', path: '/student/exams', icon: <DescriptionRoundedIcon /> },
  { label: 'Mes présences', path: '/student/attendance', icon: <AssignmentTurnedInRoundedIcon /> },
  { label: 'Groupes', path: '/student/groups', icon: <GroupsRoundedIcon /> },
  { label: 'Messages', path: '/student/messages', icon: <ChatRoundedIcon /> },
  { label: 'Réseau', path: '/student/network', icon: <PersonSearchRoundedIcon /> },
  { label: 'Profil', path: '/student/profile', icon: <PersonRoundedIcon /> },
];

const professorNav: NavItem[] = [
  { label: 'Dashboard', path: '/professor/dashboard', icon: <DashboardRoundedIcon /> },
  { label: 'Mes cours', path: '/professor/courses', icon: <MenuBookRoundedIcon /> },
  { label: 'Mes étudiants', path: '/professor/students', icon: <PeopleRoundedIcon /> },
  { label: 'Présences', path: '/professor/attendance', icon: <ChecklistRoundedIcon /> },
  { label: 'Annonces', path: '/professor/announcements', icon: <CampaignRoundedIcon /> },
  { label: 'Profil', path: '/professor/profile', icon: <PersonRoundedIcon /> },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <AdminPanelSettingsRoundedIcon /> },
  { label: 'Utilisateurs', path: '/admin/users', icon: <PeopleRoundedIcon /> },
  { label: 'Professeurs', path: '/admin/professors', icon: <SchoolRoundedIcon /> },
  { label: 'Admins', path: '/admin/admins', icon: <AdminPanelSettingsRoundedIcon /> },
  { label: 'Cours', path: '/admin/courses', icon: <FolderRoundedIcon /> },
  { label: 'Présences', path: '/admin/attendance', icon: <AssignmentTurnedInRoundedIcon /> },
  { label: 'Signalements', path: '/admin/reports', icon: <FlagRoundedIcon /> },
];

const navByRole: Record<UserRole, NavItem[]> = {
  STUDENT: studentNav,
  PROFESSOR: professorNav,
  ADMIN: adminNav,
  SUPER_ADMIN: adminNav,
};

const roleLabels: Record<UserRole, string> = {
  STUDENT: 'Étudiant',
  PROFESSOR: 'Professeur',
  ADMIN: 'Administrateur',
  SUPER_ADMIN: 'Super Admin',
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, dashboardPath } = useAuth();

  const role: UserRole = user?.role || 'STUDENT';
  const navItems = navByRole[role];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: '#fff',
      }}
    >
      {/* Logo / Branding */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 3,
          py: 3,
          cursor: 'pointer',
        }}
        onClick={() => handleNavigate(dashboardPath)}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SchoolRoundedIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
            UPF Social
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {roleLabels[role]}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: alpha('#fff', 0.12), mx: 2 }} />

      {/* Liens de navigation */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navItems.map((item) => {
          const isActive =
            item.path.endsWith('/dashboard')
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              selected={isActive}
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: '12px',
                mb: 0.5,
                mx: 1,
                py: 1.2,
                color: isActive ? theme.palette.primary.main : alpha('#fff', 0.8),
                backgroundColor: isActive ? '#fff' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive ? '#fff' : alpha('#fff', 0.08),
                  color: isActive ? theme.palette.primary.main : '#fff',
                },
                '&.Mui-selected': {
                  backgroundColor: '#fff',
                  '&:hover': {
                    backgroundColor: '#fff',
                  },
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.9rem',
                }}
              />
              {isActive && (
                <Box
                  sx={{
                    width: 4,
                    height: 24,
                    borderRadius: 2,
                    bgcolor: theme.palette.secondary.main,
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* Footer sidebar */}
      <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${alpha('#fff', 0.12)}` }}>
        <Typography variant="caption" sx={{ opacity: 0.5 }}>
          © 2026 UPF Campus Rabat
        </Typography>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, border: 'none' } }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          border: 'none',
          boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
