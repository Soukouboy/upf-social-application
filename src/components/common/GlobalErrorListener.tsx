import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

const GlobalErrorListener: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleErrorEvent = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      // Ne pas afficher pour les erreurs 401 si vous le gérez ailleurs (mais on gère au niveau de l'interceptor)
      setMessage(customEvent.detail || "Une erreur inattendue s'est produite côté serveur.");
      setOpen(true);
    };

    window.addEventListener('global-api-error', handleErrorEvent);

    return () => {
      window.removeEventListener('global-api-error', handleErrorEvent);
    };
  }, []);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity="error" variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalErrorListener;
