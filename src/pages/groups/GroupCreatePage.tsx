/**
 * GroupCreatePage — Création d'un nouveau groupe
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, MenuItem, IconButton,
  Breadcrumbs, Link, useTheme, alpha,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import type { GroupVisibility } from '../../types';
import { createGroup } from '../../services/groupService';

const GroupCreatePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GroupVisibility>('PUBLIC');
  const [major, setMajor] = useState('');
  const [error, setError] = useState('');



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom du groupe est requis');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const group = await createGroup({
        name: name.trim(),
        description: description.trim(),
        type,
        major: major.trim(),
      });
      navigate(`/student/groups/${group.id}`);
    } catch (err: any) {
      console.error('Erreur API :', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Erreur lors de la création du groupe. Veuillez vérifier tous les champs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/student/groups')}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Breadcrumbs>
          <Link component="button" variant="body2" onClick={() => navigate('/student/groups')} underline="hover" color="text.secondary">
            Groupes
          </Link>
          <Typography variant="body2" color="text.primary" fontWeight={500}>Créer un groupe</Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
        borderRadius: 4, p: 4, mb: 4, color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', bgcolor: alpha('#fff', 0.05) }} />
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <GroupsRoundedIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>Créer un nouveau groupe</Typography>
            <Typography variant="body1" sx={{ opacity: 0.85 }}>
              Rassemblez vos camarades autour d'un sujet commun
            </Typography>
          </Box>
        </Box>
      </Box>

      <UPFCard noHover>
        <Box component="form" onSubmit={handleSubmit}>


          {/* Champs du formulaire */}
          <TextField
            label="Nom du groupe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth required
            placeholder="Ex: Dev Web S4 — Révisions"
            sx={{ mb: 2.5 }}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth multiline rows={3}
            placeholder="Décrivez l'objectif du groupe, les sujets abordés…"
            sx={{ mb: 2.5 }}
          />

          <TextField
            label="Filière / Spécialité"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            fullWidth required
            placeholder="Ex: Génie Logiciel"
            sx={{ mb: 2.5 }}
          />

          <TextField
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as GroupVisibility)}
            select fullWidth
            sx={{ mb: 3 }}
          >
            <MenuItem value="PUBLIC">🌐 Public — Tout le monde peut rejoindre</MenuItem>
            <MenuItem value="PRIVATE">🔒 Privé — Sur demande uniquement</MenuItem>
          </TextField>

          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>{error}</Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <UPFButton variant="outlined" onClick={() => navigate('/student/groups')}>Annuler</UPFButton>
            <UPFButton variant="contained" type="submit" loading={loading}>Créer le groupe</UPFButton>
          </Box>
        </Box>
      </UPFCard>
    </Box>
  );
};

export default GroupCreatePage;
