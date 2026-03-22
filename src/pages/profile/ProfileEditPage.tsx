/**
 * ProfileEditPage — Modification du profil
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Alert, useTheme, alpha, Avatar, IconButton,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFChip from '../../components/ui/UPFChip';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const ProfileEditPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    competences: (user?.competences || []).join(', '),
  });
  const [newCompetence, setNewCompetence] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const competenceList = formData.competences.split(',').map((c) => c.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.put('/users/me', {
        bio: formData.bio,
        competences: competenceList,
      });
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1500);
    } catch {
      setError('Erreur lors de la mise à jour du profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/profile')}><ArrowBackRoundedIcon /></IconButton>
        <Typography variant="h5" fontWeight={700}>Modifier mon profil</Typography>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Profil mis à jour ! Redirection…</Alert>}

      <UPFCard noHover>
        {/* Avatar */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user?.avatarUrl}
              sx={{
                width: 96, height: 96,
                bgcolor: theme.palette.primary.main,
                fontSize: '2rem',
                fontWeight: 600,
              }}
            >
              {user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?'}
            </Avatar>
            <IconButton
              size="small"
              sx={{
                position: 'absolute', bottom: 0, right: 0,
                bgcolor: theme.palette.secondary.main,
                '&:hover': { bgcolor: theme.palette.secondary.dark },
                width: 32, height: 32,
              }}
            >
              <CameraAltRoundedIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
            </IconButton>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Info non modifiable */}
          <TextField label="Nom complet" value={user ? `${user.firstName} ${user.lastName}` : ''} disabled fullWidth sx={{ mb: 2 }} />
          <TextField label="Email" value={user?.email || ''} disabled fullWidth sx={{ mb: 2 }} />
          <TextField label="Filière" value={user?.filiere || ''} disabled fullWidth sx={{ mb: 2.5 }} />

          {/* Bio */}
          <TextField
            label="Biographie"
            value={formData.bio}
            onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
            fullWidth multiline rows={3} sx={{ mb: 2.5 }}
            placeholder="Parlez de vous, vos intérêts académiques…"
          />

          {/* Compétences */}
          <Typography variant="body2" fontWeight={600} mb={1}>Compétences</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
            {competenceList.map((c) => (
              <UPFChip
                key={c} label={c} size="small" colorVariant="primary"
                onDelete={() => setFormData((prev) => ({
                  ...prev,
                  competences: competenceList.filter((x) => x !== c).join(', '),
                }))}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField
              size="small" placeholder="Ajouter une compétence" fullWidth
              value={newCompetence}
              onChange={(e) => setNewCompetence(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newCompetence.trim()) {
                    setFormData((prev) => ({
                      ...prev,
                      competences: [...competenceList, newCompetence.trim()].join(', '),
                    }));
                    setNewCompetence('');
                  }
                }
              }}
            />
            <UPFButton variant="outlined" size="small" onClick={() => {
              if (newCompetence.trim()) {
                setFormData((prev) => ({
                  ...prev,
                  competences: [...competenceList, newCompetence.trim()].join(', '),
                }));
                setNewCompetence('');
              }
            }}>
              Ajouter
            </UPFButton>
          </Box>

          <UPFButton type="submit" variant="contained" fullWidth size="large" loading={loading} sx={{ py: 1.5 }}>
            Enregistrer les modifications
          </UPFButton>
        </Box>
      </UPFCard>
    </Box>
  );
};

export default ProfileEditPage;
