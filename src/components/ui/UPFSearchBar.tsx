/**
 * UPFSearchBar — Barre de recherche stylisée
 */
import React from 'react';
import { Box, InputBase, useTheme, alpha } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

interface UPFSearchBarProps {
  /** Placeholder */
  placeholder?: string;
  /** Valeur courante */
  value: string;
  /** Callback de changement */
  onChange: (value: string) => void;
  /** Pleine largeur */
  fullWidth?: boolean;
}

const UPFSearchBar: React.FC<UPFSearchBarProps> = ({
  placeholder = 'Rechercher…',
  value,
  onChange,
  fullWidth = false,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        borderRadius: '50px',
        px: 2,
        py: 0.8,
        width: fullWidth ? '100%' : 'auto',
        maxWidth: fullWidth ? undefined : 400,
        transition: 'all 0.2s',
        border: `1px solid transparent`,
        '&:focus-within': {
          bgcolor: '#fff',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
      }}
    >
      <SearchRoundedIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
      <InputBase
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        sx={{
          flex: 1,
          fontSize: '0.875rem',
        }}
      />
    </Box>
  );
};

export default UPFSearchBar;
