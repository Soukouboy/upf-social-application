/**
 * Sidebar — Navigation principale
 *
 * Éléments :
 *   - Logo UPF
 *   - Liens : Dashboard, Cours, Épreuves, Groupes, Profil
 *   - Indicateur de route active (couleur secondary)
 *   - Version mobile : drawer temporaire
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

export const SIDEBAR_WIDTH = 260;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardRoundedIcon /> },
  { label: 'Cours', path: '/courses', icon: <MenuBookRoundedIcon /> },
  { label: 'Épreuves', path: '/exams', icon: <DescriptionRoundedIcon /> },
  { label: 'Groupes', path: '/groups', icon: <GroupsRoundedIcon /> },
  { label: 'Réseau', path: '/network', icon: <PersonSearchRoundedIcon /> },
  { label: 'Profil', path: '/profile', icon: <PersonRoundedIcon /> },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();

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
        onClick={() => handleNavigate('/dashboard')}
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
            Campus Rabat
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: alpha('#fff', 0.12), mx: 2 }} />

      {/* Liens de navigation */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
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
                color: isActive ? theme.palette.secondary.main : alpha('#fff', 0.8),
                backgroundColor: isActive
                  ? alpha(theme.palette.secondary.main, 0.12)
                  : 'transparent',
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.08),
                  color: '#fff',
                },
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.12),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.18),
                  },
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon
                sx={{
                  color: 'inherit',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.9rem',
                }}
              />
              {/* Indicateur actif */}
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

  // Mobile : Drawer temporaire
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Desktop : Drawer permanent
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
