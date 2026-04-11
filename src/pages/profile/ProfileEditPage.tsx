/**
 * ProfileEditPage — Modification du profil (champs adaptés par rôle)
 *
 * STUDENT : bio, isProfilePublic, photo
 * PROFESSOR : bio, department, title, photo
 * ADMIN : email readonly (pas de modification via cette page)
 */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Alert, useTheme, Avatar, IconButton, Switch, FormControlLabel,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const ProfileEditPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const role = user?.role;
  const studentData = user?.profileData?.studentProfile;
  const profData = user?.profileData?.professorProfile;

  // Formulaire étudiant
  const [studentForm, setStudentForm] = useState({
    bio: studentData?.bio || (user as any)?.bio || '',
    isProfilePublic: studentData?.isProfilePublic ?? true,
  });

  // Formulaire professeur
  const [profForm, setProfForm] = useState({
    bio: profData?.bio || '',
    department: profData?.department || '',
    title: profData?.title || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', avatarFile);
      await api.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAvatarFile(null);
    } catch {
      setError("Erreur lors de l'upload de la photo.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (avatarFile) await handleAvatarUpload();

      if (role === 'STUDENT') {
        await api.put('/users/me', {
          bio: studentForm.bio,
          isProfilePublic: studentForm.isProfilePublic,
        });
      } else if (role === 'PROFESSOR') {
        await api.put('/users/me', {
          bio: profForm.bio,
          department: profForm.department,
          title: profForm.title,
        });
      }

      setSuccess(true);
      const redirectPath = role === 'PROFESSOR' ? '/professor/profile' : '/student/profile';
      setTimeout(() => navigate(redirectPath), 1500);
    } catch {
      setError('Erreur lors de la mise à jour du profil. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const getBackPath = () => {
    if (role === 'PROFESSOR') return '/professor/profile';
    return '/student/profile';
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate(getBackPath())}><ArrowBackRoundedIcon /></IconButton>
        <Typography variant="h5" fontWeight={700}>Modifier mon profil</Typography>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Profil mis à jour ! Redirection…</Alert>}

      <UPFCard noHover>
        {/* Avatar with upload */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={avatarPreview || undefined}
              sx={{ width: 96, height: 96, bgcolor: theme.palette.primary.main, fontSize: '2rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s', '&:hover': { opacity: 0.8 } }}
              onClick={() => avatarInputRef.current?.click()}
            >
              {user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?'}
            </Avatar>
            <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            <IconButton size="small" onClick={() => avatarInputRef.current?.click()}
              sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: theme.palette.secondary.main, '&:hover': { bgcolor: theme.palette.secondary.dark }, width: 32, height: 32 }}>
              <CameraAltRoundedIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
            </IconButton>
          </Box>
        </Box>

        {avatarFile && (
          <Typography variant="caption" color="primary.main" sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
            📷 Nouvelle photo sélectionnée — elle sera uploadée à l'enregistrement
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Champs communs non modifiables */}
          <TextField label="Nom complet" value={user ? `${user.firstName} ${user.lastName}` : ''} disabled fullWidth sx={{ mb: 2 }} />
          <TextField label="Email" value={user?.email || ''} disabled fullWidth sx={{ mb: 2.5 }} />

          {/* ─── Champs spécifiques STUDENT ─── */}
          {(role === 'STUDENT') && (
            <>
              <TextField
                label="Filière"
                value={studentData?.major || (user as any)?.major || ''}
                disabled fullWidth sx={{ mb: 2 }}
                helperText="La filière est définie par l'administration"
              />
              <TextField
                label="Année d'études"
                value={studentData?.currentYear || (user as any)?.currentYear || ''}
                disabled fullWidth sx={{ mb: 2.5 }}
              />
              <TextField
                label="Biographie"
                value={studentForm.bio}
                onChange={(e) => setStudentForm((prev) => ({ ...prev, bio: e.target.value }))}
                fullWidth multiline rows={3} sx={{ mb: 2.5 }}
                placeholder="Présentez-vous à vos camarades…"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={studentForm.isProfilePublic}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, isProfilePublic: e.target.checked }))}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>Profil public</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {studentForm.isProfilePublic
                        ? 'Votre profil est visible par les autres étudiants'
                        : 'Votre profil est privé'}
                    </Typography>
                  </Box>
                }
                sx={{ mb: 3, alignItems: 'flex-start', '& .MuiSwitch-root': { mt: 0.5 } }}
              />
            </>
          )}

          {/* ─── Champs spécifiques PROFESSOR ─── */}
          {role === 'PROFESSOR' && (
            <>
              <TextField
                label="Titre (Dr., Pr., etc.)"
                value={profForm.title}
                onChange={(e) => setProfForm((prev) => ({ ...prev, title: e.target.value }))}
                fullWidth sx={{ mb: 2 }}
                placeholder="Dr., Pr., M., Mme…"
              />
              <TextField
                label="Département"
                value={profForm.department}
                onChange={(e) => setProfForm((prev) => ({ ...prev, department: e.target.value }))}
                fullWidth sx={{ mb: 2 }}
                placeholder="Informatique, Mathématiques…"
              />
              <TextField
                label="Biographie"
                value={profForm.bio}
                onChange={(e) => setProfForm((prev) => ({ ...prev, bio: e.target.value }))}
                fullWidth multiline rows={3} sx={{ mb: 3 }}
                placeholder="Présentez-vous à vos étudiants…"
              />
            </>
          )}

          {/* ─── Admin : lecture seule ─── */}
          {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Les informations du compte administrateur ne peuvent pas être modifiées via cette interface.
              Contactez votre super administrateur.
            </Alert>
          )}

          <UPFButton
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            loading={loading || avatarUploading}
            disabled={role === 'ADMIN' || role === 'SUPER_ADMIN'}
            sx={{ py: 1.5 }}
          >
            {avatarUploading ? 'Upload de la photo…' : 'Enregistrer les modifications'}
          </UPFButton>
        </Box>
      </UPFCard>
    </Box>
  );
};

export default ProfileEditPage;
