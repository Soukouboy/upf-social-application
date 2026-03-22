/**
 * Thème Material UI — UPF Campus Rabat
 * 
 * Palette officielle :
 *   - primary (bleu foncé campus) : #003366
 *   - secondary (orange/jaune accent) : #FFC247
 *   - background : gris clair #F5F6FA / blanc #FFFFFF
 * 
 * Typographie : Inter (Google Fonts)
 * Composants : coins arrondis, ombres subtiles, style réseau social moderne
 */
import { createTheme, alpha } from '@mui/material/styles';

const UPF_PRIMARY = '#ad0591ff';
const UPF_SECONDARY = '#1b0a66ff';

const theme = createTheme({
  palette: {
    primary: {
      main: UPF_PRIMARY,
      light: '#1a5276',
      dark: '#001a33',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: UPF_SECONDARY,
      light: '#FFD470',
      dark: '#E5A620',
      contrastText: '#003366',
    },
    background: {
      default: '#F5F6FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#6B7280',
    },
    divider: '#E5E7EB',
    error: {
      main: '#EF4444',
    },
    success: {
      main: '#10B981',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#3B82F6',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.938rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.813rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06)',
    '0 2px 6px rgba(0,0,0,0.08)',
    '0 4px 12px rgba(0,0,0,0.1)',
    '0 6px 16px rgba(0,0,0,0.12)',
    '0 8px 24px rgba(0,0,0,0.14)',
    '0 12px 32px rgba(0,0,0,0.16)',
    '0 16px 40px rgba(0,0,0,0.18)',
    '0 20px 48px rgba(0,0,0,0.20)',
    // Remplissage des ombres restantes (MUI en attend 25)
    ...Array(16).fill('0 24px 56px rgba(0,0,0,0.22)'),
  ] as unknown as typeof createTheme extends (o: infer O) => unknown ? O extends { shadows: infer S } ? S : never : never,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: `${alpha(UPF_PRIMARY, 0.3)} transparent`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          padding: '8px 24px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,51,102,0.2)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${UPF_PRIMARY} 0%, #1a5276 100%)`,
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${UPF_SECONDARY} 0%, #FFD470 100%)`,
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.3s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,51,102,0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: UPF_PRIMARY,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: `2px solid ${alpha(UPF_PRIMARY, 0.1)}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: alpha(UPF_SECONDARY, 0.15),
            color: UPF_PRIMARY,
            '&:hover': {
              backgroundColor: alpha(UPF_SECONDARY, 0.25),
            },
            '& .MuiListItemIcon-root': {
              color: UPF_PRIMARY,
            },
          },
        },
      },
    },
  },
});

export default theme;
