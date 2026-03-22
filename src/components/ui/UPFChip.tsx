/**
 * UPFChip — Chip/Tag stylisé UPF
 */
import React from 'react';
import { Chip, type ChipProps, useTheme, alpha } from '@mui/material';

interface UPFChipProps extends ChipProps {
  /** Variante de couleur UPF */
  colorVariant?: 'primary' | 'secondary' | 'success' | 'error' | 'info';
}

const UPFChip: React.FC<UPFChipProps> = ({ colorVariant = 'primary', sx, ...props }) => {
  const theme = useTheme();

  const colorMap: Record<string, string> = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };

  const baseColor = colorMap[colorVariant] || theme.palette.primary.main;

  return (
    <Chip
      sx={{
        bgcolor: alpha(baseColor, 0.1),
        color: baseColor,
        fontWeight: 500,
        border: `1px solid ${alpha(baseColor, 0.2)}`,
        '&:hover': {
          bgcolor: alpha(baseColor, 0.18),
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default UPFChip;
