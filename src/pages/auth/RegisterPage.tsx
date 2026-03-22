/**
 * RegisterPage — Page d'inscription
 *
 * Formulaire multi-champs :
 *   - Prénom, Nom
 *   - Email @upf.ac.ma
 *   - Mot de passe (avec indicateur de force)
 *   - Filière, Année
 *
 * Redirige vers /dashboard après inscription réussie.
 */
import React, { useState, useMemo } from 'react';
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
  MenuItem,
  LinearProgress,
  Grid,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import UPFButton from '../../components/ui/UPFButton';
import { useAuth } from '../../hooks/useAuth';

// Filières disponibles
const FILIERES = [
  'Informatique',
  'Gestion',
  'Finance',
  'Marketing',
  'Droit',
  'Sciences Politiques',
  'Communication',
  'Ingénierie',
];

const ANNEES = [1, 2, 3, 4, 5];

/** Calcul de la force du mot de passe (0-100) */
const getPasswordStrength = (password: string): number => {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
  if (/\d/.test(password)) score += 20;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
  return Math.min(score, 100);
};

const getStrengthLabel = (strength: number): { label: string; color: string } => {
  if (strength < 30) return { label: 'Faible', color: '#EF4444' };
  if (strength < 60) return { label: 'Moyen', color: '#F59E0B' };
  if (strength < 80) return { label: 'Fort', color: '#3B82F6' };
  return { label: 'Très fort', color: '#10B981' };
};

const RegisterPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    filiere: '',
    annee: 1,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
  const strengthInfo = useMemo(() => getStrengthLabel(passwordStrength), [passwordStrength]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.filiere) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!formData.email.endsWith('@upf.ac.ma')) {
      setError('Veuillez utiliser votre adresse e-mail UPF (@upf.ac.ma).');
      return;
    }

    if (passwordStrength < 50) {
      setError('Votre mot de passe est trop faible. Ajoutez des majuscules, chiffres et caractères spéciaux.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Erreur lors de l\'inscription. Cet e-mail est peut-être déjà utilisé.');
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
          display: { xs: 'none', lg: 'flex' },
          width: 420,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 60%, #000d1a 100%)`,
          color: '#fff',
          p: 5,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Cercles décoratifs */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.secondary.main, 0.08),
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 250,
            height: 250,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.secondary.main, 0.06),
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '18px',
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: `0 8px 32px ${alpha(theme.palette.secondary.main, 0.3)}`,
            }}
          >
            <SchoolRoundedIcon sx={{ fontSize: 36, color: theme.palette.primary.main }} />
          </Box>
          <Typography variant="h4" fontWeight={700} mb={1}>
            Rejoignez UPF Social
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Créez votre profil et connectez-vous avec la communauté UPF Campus Rabat.
          </Typography>
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
          p: { xs: 3, sm: 5 },
          overflow: 'auto',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          <Typography variant="h4" fontWeight={700} mb={0.5}>
            Créer un compte 🎓
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Inscrivez-vous avec votre adresse e-mail UPF
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Prénom / Nom */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id="register-firstname"
                  label="Prénom"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id="register-lastname"
                  label="Nom"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            {/* Email */}
            <TextField
              id="register-email"
              label="Adresse e-mail UPF"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="prenom.nom@upf.ac.ma"
              fullWidth
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Mot de passe */}
            <TextField
              id="register-password"
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              placeholder="Min. 8 caractères, mixte"
              fullWidth
              required
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

            {/* Indicateur de force */}
            {formData.password && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: alpha(strengthInfo.color, 0.15),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: strengthInfo.color,
                      borderRadius: 2,
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: strengthInfo.color, mt: 0.5, display: 'block' }}>
                  Force : {strengthInfo.label}
                </Typography>
              </Box>
            )}

            {/* Filière / Année */}
            <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
              <Grid size={{ xs: 12, sm: 7 }}>
                <TextField
                  id="register-filiere"
                  label="Filière"
                  value={formData.filiere}
                  onChange={handleChange('filiere')}
                  fullWidth
                  required
                  select
                >
                  {FILIERES.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  id="register-annee"
                  label="Année"
                  value={formData.annee}
                  onChange={handleChange('annee')}
                  fullWidth
                  required
                  select
                >
                  {ANNEES.map((a) => (
                    <MenuItem key={a} value={a}>
                      {a}ère/ème année
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <UPFButton
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              loading={loading}
              sx={{ py: 1.5, fontSize: '1rem', mb: 3 }}
            >
              Créer mon compte
            </UPFButton>
          </Box>

          <Typography variant="body2" textAlign="center">
            Déjà inscrit ?{' '}
            <Link component={RouterLink} to="/login" fontWeight={600} sx={{ color: 'primary.main' }}>
              Se connecter
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
