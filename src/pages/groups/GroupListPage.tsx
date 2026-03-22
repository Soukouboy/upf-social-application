/**
 * GroupListPage — Liste des groupes
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Skeleton, useTheme, alpha,
} from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import UPFChip from '../../components/ui/UPFChip';
import UPFButton from '../../components/ui/UPFButton';
import EmptyState from '../../components/common/EmptyState';
import type { Group } from '../../types';
import { getGroups } from '../../services/groupService';

const GroupListPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const data = await getGroups();
        setGroups(data);
      } catch {
        setGroups(MOCK_GROUPS);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} mb={0.5}>👥 Groupes</Typography>
          <Typography variant="body1" color="text.secondary">
            Rejoignez des groupes d'étude et collaborez avec vos camarades
          </Typography>
        </Box>
        <UPFButton variant="contained" startIcon={<AddRoundedIcon />}>
          Créer un groupe
        </UPFButton>
      </Box>

      <Box sx={{ mb: 4 }}>
        <UPFSearchBar placeholder="Rechercher un groupe…" value={search} onChange={setSearch} fullWidth />
      </Box>

      {loading ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
              <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : filteredGroups.length === 0 ? (
        <EmptyState title="Aucun groupe trouvé" description="Créez un nouveau groupe pour commencer !" icon={<GroupsRoundedIcon />} />
      ) : (
        <Grid container spacing={2.5}>
          {filteredGroups.map((group) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={group.id}>
              <UPFCard
                sx={{ cursor: 'pointer', height: '100%', position: 'relative', overflow: 'hidden' }}
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                {/* Bande de couleur en haut */}
                <Box sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                  background: group.visibility === 'PUBLIC'
                    ? `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`
                    : `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.secondary.main})`,
                }} />

                <Box sx={{ display: 'flex', gap: 1, mb: 2, mt: 1 }}>
                  <UPFChip
                    label={group.visibility === 'PUBLIC' ? 'Public' : 'Privé'}
                    size="small"
                    colorVariant={group.visibility === 'PUBLIC' ? 'info' : 'secondary'}
                    icon={group.visibility === 'PUBLIC' ? <PublicRoundedIcon /> : <LockRoundedIcon />}
                  />
                </Box>

                <Typography variant="h6" fontWeight={600} mb={0.5}>{group.name}</Typography>
                {group.description && (
                  <Typography variant="body2" color="text.secondary" mb={2}
                    sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {group.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PeopleRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {group.memberCount} membre{group.memberCount > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <UPFButton size="small" variant="text" endIcon={<ArrowForwardRoundedIcon />} sx={{ color: 'primary.main' }}>
                    Voir
                  </UPFButton>
                </Box>
              </UPFCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

const MOCK_GROUPS: Group[] = [
  { id: 1, name: 'Dev Web S4', description: 'Groupe d\'entraide pour le module Développement Web du semestre 4. React, Node.js, API REST.', visibility: 'PUBLIC', memberCount: 28, createdBy: { id: 1, firstName: 'Amina', lastName: 'Benali' }, createdAt: '2025-02-10', coverImageUrl: undefined },
  { id: 2, name: 'Prépa Examen Algo', description: 'Préparation intensive pour l\'examen final d\'algorithmique. Exercices, annales, discussions.', visibility: 'PUBLIC', memberCount: 45, createdBy: { id: 2, firstName: 'Youssef', lastName: 'Karimi' }, createdAt: '2025-05-01', coverImageUrl: undefined },
  { id: 3, name: 'Projet PFE — IA Médicale', description: 'Groupe privé pour le projet de fin d\'études sur l\'intelligence artificielle appliquée au diagnostic médical.', visibility: 'PRIVATE', memberCount: 6, createdBy: { id: 3, firstName: 'Sara', lastName: 'Moussaoui' }, createdAt: '2025-01-15', coverImageUrl: undefined },
  { id: 4, name: 'Club Entrepreneuriat UPF', description: 'Le club entrepreneuriat de l\'UPF Campus Rabat. Business plans, networking, pitch sessions.', visibility: 'PUBLIC', memberCount: 62, createdBy: { id: 4, firstName: 'Omar', lastName: 'Tazi' }, createdAt: '2024-09-20', coverImageUrl: undefined },
  { id: 5, name: 'BDD Avancées — Projet', description: 'Collaboration sur le projet de base de données avancées. PostgreSQL, optimisation.', visibility: 'PRIVATE', memberCount: 8, createdBy: { id: 1, firstName: 'Amina', lastName: 'Benali' }, createdAt: '2025-03-01', coverImageUrl: undefined },
  { id: 6, name: 'Stage & Emploi', description: 'Partage d\'offres de stages et d\'emploi pour les étudiants UPF.', visibility: 'PUBLIC', memberCount: 120, createdBy: { id: 5, firstName: 'Leila', lastName: 'Fassi' }, createdAt: '2024-10-01', coverImageUrl: undefined },
];

export default GroupListPage;
