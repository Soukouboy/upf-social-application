/**
 * UPFModal — Modale stylisée UPF
 */
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  type DialogProps,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface UPFModalProps extends Omit<DialogProps, 'title'> {
  /** Titre de la modale */
  title: string;
  /** Contenu de la modale */
  children: React.ReactNode;
  /** Actions (boutons du footer) */
  actions?: React.ReactNode;
  /** Callback de fermeture */
  onClose: () => void;
}

const UPFModal: React.FC<UPFModalProps> = ({ title, children, actions, onClose, ...props }) => {
  return (
    <Dialog
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          minWidth: { xs: '90%', sm: 440 },
          maxWidth: 600,
        },
      }}
      {...props}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>{children}</DialogContent>
      {actions && <DialogActions sx={{ px: 3, pb: 2.5 }}>{actions}</DialogActions>}
    </Dialog>
  );
};

export default UPFModal;
