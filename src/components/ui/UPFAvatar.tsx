/**
 * UPFAvatar — Avatar stylisé UPF
 *
 * Affiche la photo de profil ou les initiales de l'utilisateur.
 */
import React from 'react';
import { Avatar, type AvatarProps, Badge, useTheme, alpha } from '@mui/material';

interface UPFAvatarProps extends AvatarProps {
  /** Prénom de l'utilisateur (pour les initiales) */
  firstName?: string;
  /** Nom de l'utilisateur (pour les initiales) */
  lastName?: string;
  /** Afficher un indicateur en ligne */
  online?: boolean;
  /** Taille de l'avatar */
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: 32,
  medium: 40,
  large: 56,
};

const UPFAvatar: React.FC<UPFAvatarProps> = ({
  firstName,
  lastName,
  online,
  size = 'medium',
  sx,
  ...props
}) => {
  const theme = useTheme();
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  const dimension = sizeMap[size];

  const avatar = (
    <Avatar
      sx={{
        width: dimension,
        height: dimension,
        bgcolor: theme.palette.primary.main,
        fontSize: dimension * 0.38,
        fontWeight: 600,
        border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        ...sx,
      }}
      {...props}
    >
      {!props.src && initials}
    </Avatar>
  );

  if (online !== undefined) {
    return (
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: online ? '#10B981' : '#9CA3AF',
            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
            width: 10,
            height: 10,
            borderRadius: '50%',
          },
        }}
      >
        {avatar}
      </Badge>
    );
  }

  return avatar;
};

export default UPFAvatar;
