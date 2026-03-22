/**
 * Spinner de chargement réutilisable
 *
 * Peut être utilisé en pleine page (fullPage) ou inline.
 */
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  /** Afficher en pleine page (centré verticalement) */
  fullPage?: boolean;
  /** Message sous le spinner */
  message?: string;
  /** Taille du spinner */
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullPage = false,
  message,
  size = 40,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullPage && {
          minHeight: '100vh',
          width: '100%',
        }),
        ...(!fullPage && {
          py: 4,
        }),
      }}
    >
      <CircularProgress
        size={size}
        sx={{
          color: 'primary.main',
        }}
      />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;
