/**
 * Topbar — Barre supérieure
 *
 * Contient :
 *   - Bouton menu hamburger (mobile)
 *   - Barre de recherche
 *   - Cloche de notifications avec badge
 *   - Avatar de l'utilisateur avec menu dropdown (profil, déconnexion)
 */
import React, { useState, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  InputBase,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  useTheme,
  useMediaQuery,
  alpha,
  Tooltip,
  Divider,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NotificationContext } from '../../context/NotificationContext';
import { SIDEBAR_WIDTH } from './Sidebar';

interface TopbarProps {
  onMenuToggle: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { unreadCount, notifications, markAllAsRead } = useContext(NotificationContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const notifMenuOpen = Boolean(notifAnchorEl);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    const role = user?.role;
    if (role === 'PROFESSOR') navigate('/professor/profile');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
    else navigate('/student/profile');
  };

  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
    markAllAsRead();
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  // Initiales de l'utilisateur pour l'avatar
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: alpha('#FFFFFF', 0.8),
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        ...(! isMobile && {
          width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
          ml: `${SIDEBAR_WIDTH}px`,
        }),
      }}
    >
      <Toolbar sx={{ gap: 2, px: { xs: 2, md: 3 } }}>
        {/* Bouton menu — mobile uniquement */}
        {isMobile && (
          <IconButton onClick={onMenuToggle} edge="start">
            <MenuRoundedIcon />
          </IconButton>
        )}

        {/* Barre de recherche */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 480,
            display: 'flex',
            alignItems: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: '50px',
            px: 2,
            py: 0.5,
            transition: 'all 0.2s',
            '&:focus-within': {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.15)}`,
            },
          }}
        >
          <SearchRoundedIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
          <InputBase
            placeholder="Rechercher des cours, épreuves, groupes…"
            sx={{
              flex: 1,
              fontSize: '0.875rem',
              '& input::placeholder': {
                opacity: 0.6,
              },
            }}
          />
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            onClick={handleNotifOpen}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
            }}
          >
            <Badge
              badgeContent={unreadCount > 0 ? unreadCount : null}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.65rem',
                  minWidth: 18,
                  height: 18,
                },
              }}
            >
              <NotificationsRoundedIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Menu des notifications */}
        <Menu
          anchorEl={notifAnchorEl}
          open={notifMenuOpen}
          onClose={handleNotifClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 320,
              maxWidth: 360,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" fontWeight={700}>Notifications</Typography>
            {unreadCount > 0 && (
              <Typography variant="caption" color="primary.main" sx={{ cursor: 'pointer' }} onClick={markAllAsRead}>
                Tout marquer lu
              </Typography>
            )}
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Aucune notification</Typography>
            </Box>
          ) : (
            notifications.slice(0, 5).map((notif: any) => (
              <MenuItem
                key={notif.id}
                onClick={handleNotifClose}
                sx={{
                  py: 1.5,
                  borderLeft: notif.read ? 'none' : `3px solid ${theme.palette.primary.main}`,
                  bgcolor: notif.read ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
                  whiteSpace: 'normal',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={notif.read ? 400 : 600}>
                    {notif.title || notif.message || 'Nouvelle notification'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Menu>

        {/* Avatar utilisateur */}
        <Tooltip title="Mon profil">
          <IconButton onClick={handleAvatarClick} sx={{ p: 0.5 }}>
            <Avatar
              src={user?.avatarUrl}
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.primary.main,
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                '&:hover': {
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.secondary.main, 0.4)}`,
                },
              }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>

        {/* Menu dropdown utilisateur */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            },
          }}
        >
          {/* En-tête utilisateur */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || ''}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <PersonRoundedIcon fontSize="small" />
            </ListItemIcon>
            Mon profil
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <SettingsRoundedIcon fontSize="small" />
            </ListItemIcon>
            Paramètres
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            Déconnexion
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
