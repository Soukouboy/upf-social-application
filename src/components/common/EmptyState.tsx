/**
 * Composant EmptyState — Affiché quand une liste est vide
 *
 * Personnalisable avec icône, titre, description et action.
 */
import React, { type ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  /** Icône à afficher (composant MUI Icon) */
  icon?: ReactNode;
  /** Titre principal */
  title: string;
  /** Description secondaire */
  description?: string;
  /** Texte du bouton d'action */
  actionLabel?: string;
  /** Callback du bouton d'action */
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          opacity: 0.1,
        }}
      >
        {icon || <InboxIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
      </Box>
      {icon || <InboxIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" maxWidth={360} mb={3}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
