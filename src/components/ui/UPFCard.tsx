/**
 * UPFCard — Carte stylisée UPF
 *
 * Carte avec coins arrondis, ombre au survol et animation subtile.
 */
import React from 'react';
import { Card, CardContent, type CardProps } from '@mui/material';

interface UPFCardProps extends CardProps {
  /** Désactiver l'animation de survol */
  noHover?: boolean;
  /** Padding personnalisé */
  padding?: number;
}

const UPFCard: React.FC<UPFCardProps> = ({ noHover, padding, children, sx, ...props }) => {
  return (
    <Card
      sx={{
        ...(noHover && {
          '&:hover': { boxShadow: undefined, transform: 'none' },
        }),
        ...sx,
      }}
      {...props}
    >
      <CardContent sx={{ p: padding ?? 3, '&:last-child': { pb: padding ?? 3 } }}>
        {children}
      </CardContent>
    </Card>
  );
};

export default UPFCard;
