/**
 * Error Boundary — Capture les erreurs React et affiche un fallback
 */
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: ReactNode;
  /** Composant de fallback personnalisé (optionnel) */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary a capturé une erreur :', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            gap: 2,
            p: 4,
            textAlign: 'center',
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', opacity: 0.7 }} />
          <Typography variant="h5" fontWeight={600}>
            Oups, une erreur est survenue
          </Typography>
          <Typography variant="body2" color="text.secondary" maxWidth={400}>
            {this.state.error?.message || 'Une erreur inattendue s\'est produite.'}
          </Typography>
          <Button
            variant="contained"
            onClick={this.handleReset}
            sx={{ mt: 2 }}
          >
            Réessayer
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
