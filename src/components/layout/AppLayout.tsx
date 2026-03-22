/**
 * AppLayout — Coquille principale de l'application
 *
 * Structure type "dashboard social" :
 *   - Sidebar fixe à gauche (permanente desktop, drawer mobile)
 *   - Topbar fixe en haut
 *   - Zone de contenu scrollable au centre
 *
 * Utilisé pour encapsuler toutes les routes protégées.
 */
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import Topbar from './Topbar';

const AppLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Zone principale */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: isMobile ? '100%' : `calc(100% - ${SIDEBAR_WIDTH}px)`,
          minHeight: '100vh',
        }}
      >
        {/* Topbar */}
        <Topbar onMenuToggle={handleMenuToggle} />

        {/* Spacer pour la topbar fixe */}
        <Toolbar />

        {/* Contenu de la page */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            maxWidth: 1200,
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
