/**
 * LoginPage — Page de connexion
 *
 * Design split :
 *   - Panneau gauche : branding UPF avec illustration et gradient
 *   - Panneau droit : formulaire de connexion
 *
 * Validation :
 *   - Email obligatoire, format @upf.ac.ma
 *   - Mot de passe obligatoire
 *   - Gestion d'erreurs avec feedback visuel
 */
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
  Link,
  Divider,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import UPFButton from '../../components/ui/UPFButton';
import { useAuth } from '../../hooks/useAuth';

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (!email.endsWith('@upf.ac.ma')) {
      setError('Veuillez utiliser votre adresse e-mail UPF (@upf.ac.ma).');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login({ email, password });
      // Redirection basée sur le rôle
      const rolePrefix = loggedUser.role === 'ADMIN' ? '/admin' : loggedUser.role === 'PROFESSOR' ? '/professor' : '/student';
      navigate(`${rolePrefix}/dashboard`, { replace: true });
    } catch {
      setError('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* ────────── Panneau gauche : branding ────────── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 60%, #000d1a 100%)`,
          color: '#fff',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Cercles décoratifs */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.secondary.main, 0.08),
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.secondary.main, 0.06),
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
          {/* Logo */}
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: `0 8px 32px ${alpha(theme.palette.secondary.main, 0.3)}`,
            }}
          >
            <SchoolRoundedIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          </Box>

          <Typography variant="h3" fontWeight={700} mb={1}>
            UPF Social
          </Typography>
          <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.8, mb: 5 }}>
            Le réseau académique de l'UPF Campus Rabat
          </Typography>

          {/* Points forts */}
          {[
            { icon: <AutoStoriesRoundedIcon />, text: 'Accédez à tous vos cours' },
            { icon: <EmojiEventsRoundedIcon />, text: 'Partagez et trouvez des épreuves' },
            { icon: <GroupsRoundedIcon />, text: 'Rejoignez des groupes d\'étude' },
          ].map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2.5,
                p: 2,
                borderRadius: 3,
                bgcolor: alpha('#fff', 0.06),
                backdropFilter: 'blur(10px)',
                transition: 'background 0.2s',
                '&:hover': { bgcolor: alpha('#fff', 0.1) },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.secondary.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.secondary.main,
                }}
              >
                {item.icon}
              </Box>
              <Typography variant="body1" fontWeight={500}>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ────────── Panneau droit : formulaire ────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 6 },
          maxWidth: { md: 520 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Logo mobile */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              gap: 1.5,
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SchoolRoundedIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="primary">
              UPF Social
            </Typography>
          </Box>

          <Typography variant="h4" fontWeight={700} mb={0.5}>
            Bon retour ! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Connectez-vous à votre compte UPF
          </Typography>

          {/* Alerte d'erreur */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          {/* Formulaire */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              id="login-email"
              label="Adresse e-mail UPF"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@upf.ac.ma"
              fullWidth
              required
              autoComplete="email"
              autoFocus
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              id="login-password"
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              fullWidth
              required
              autoComplete="current-password"
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOffRoundedIcon fontSize="small" />
                      ) : (
                        <VisibilityRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Link
                component="button"
                variant="body2"
                type="button"
                sx={{ color: 'primary.main', fontWeight: 500 }}
              >
                Mot de passe oublié ?
              </Link>
            </Box>

            <UPFButton
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              loading={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                mb: 3,
              }}
            >
              Se connecter
            </UPFButton>
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              OU
            </Typography>
          </Divider>

          <Typography variant="body2" textAlign="center" mt={2}>
            Pas encore de compte ?{' '}
            <Link
              component={RouterLink}
              to="/register"
              fontWeight={600}
              sx={{ color: 'primary.main' }}
            >
              Créer un compte
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
