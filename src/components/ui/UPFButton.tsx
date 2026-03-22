/**
 * UPFButton — Bouton stylisé UPF (pill shape)
 *
 * Wrapper autour du Button MUI avec des variantes UPF prédéfinies.
 */
import React from 'react';
import { Button, type ButtonProps, CircularProgress } from '@mui/material';

interface UPFButtonProps extends ButtonProps {
  /** Afficher un spinner de chargement */
  loading?: boolean;
}

const UPFButton: React.FC<UPFButtonProps> = ({
  loading = false,
  disabled,
  children,
  startIcon,
  ...props
}) => {
  return (
    <Button
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : startIcon}
      {...props}
    >
      {children}
    </Button>
  );
};

export default UPFButton;
