/**
 * GroupDetailPage — Détail d'un groupe
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, List, ListItem, ListItemText, IconButton,
  Breadcrumbs, Link, useTheme, alpha, Divider,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFChip from '../../components/ui/UPFChip';
import UPFButton from '../../components/ui/UPFButton';
import UPFAvatar from '../../components/ui/UPFAvatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Group, GroupMembership } from '../../types';
import { getGroupById, getGroupMembers, joinGroup } from '../../services/groupService';

const GroupDetailPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [groupData, membersData] = await Promise.all([
          getGroupById(Number(id)),
          getGroupMembers(Number(id)),
        ]);
        setGroup(groupData);
        setMembers(membersData);
      } catch {
        setGroup({
          id: Number(id), name: 'Dev Web S4',
          description: 'Groupe d\'entraide pour le module Développement Web du semestre 4. React, Node.js, API REST. Partagez vos ressources, posez vos questions et entraidez-vous !',
          visibility: 'PUBLIC', memberCount: 28,
          createdBy: { id: 1, firstName: 'Amina', lastName: 'Benali' },
          createdAt: '2025-02-10', coverImageUrl: undefined,
        });
        setMembers([
          { id: 1, groupId: Number(id), user: { id: 1, firstName: 'Amina', lastName: 'Benali', avatarUrl: undefined }, role: 'ADMIN', status: 'ACTIVE', joinedAt: '2025-02-10' },
          { id: 2, groupId: Number(id), user: { id: 2, firstName: 'Youssef', lastName: 'Karimi', avatarUrl: undefined }, role: 'MODERATOR', status: 'ACTIVE', joinedAt: '2025-02-11' },
          { id: 3, groupId: Number(id), user: { id: 3, firstName: 'Sara', lastName: 'Moussaoui', avatarUrl: undefined }, role: 'MEMBER', status: 'ACTIVE', joinedAt: '2025-02-12' },
          { id: 4, groupId: Number(id), user: { id: 4, firstName: 'Omar', lastName: 'Tazi', avatarUrl: undefined }, role: 'MEMBER', status: 'ACTIVE', joinedAt: '2025-02-13' },
        ]);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage message="Chargement du groupe…" />;
  if (!group) return null;

  const roleColor: Record<string, 'error' | 'secondary' | 'info'> = { ADMIN: 'error', MODERATOR: 'secondary', MEMBER: 'info' };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/groups')}><ArrowBackRoundedIcon /></IconButton>
        <Breadcrumbs>
          <Link component="button" variant="body2" onClick={() => navigate('/groups')} underline="hover" color="text.secondary">Groupes</Link>
          <Typography variant="body2" color="text.primary" fontWeight={500}>{group.name}</Typography>
        </Breadcrumbs>
      </Box>

      {/* En-tête du groupe */}
      <Box sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
        borderRadius: 4, p: 4, mb: 4, color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', bgcolor: alpha('#fff', 0.05) }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <UPFChip
              label={group.visibility === 'PUBLIC' ? 'Public' : 'Privé'}
              icon={group.visibility === 'PUBLIC' ? <PublicRoundedIcon /> : <LockRoundedIcon />}
              sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
            />
          </Box>
          <Typography variant="h4" fontWeight={700} mb={1}>{group.name}</Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, mb: 2 }}>{group.description}</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <UPFButton
              variant="contained" startIcon={<ChatRoundedIcon />}
              onClick={() => navigate(`/groups/${group.id}/chat`)}
              sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.3), boxShadow: 'none' } }}
            >
              Ouvrir le chat
            </UPFButton>
            <UPFButton
              variant="outlined"
              sx={{ borderColor: alpha('#fff', 0.3), color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: alpha('#fff', 0.1) } }}
            >
              Rejoindre
            </UPFButton>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <UPFCard noHover>
            <Typography variant="h6" fontWeight={600} mb={2}>À propos</Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>{group.description}</Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight={700} color="primary.main">{group.memberCount}</Typography>
                <Typography variant="caption" color="text.secondary">Membres</Typography>
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} color="secondary.main">
                  {new Date(group.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                </Typography>
                <Typography variant="caption" color="text.secondary">Créé en</Typography>
              </Box>
            </Box>
          </UPFCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <UPFCard noHover>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PeopleRoundedIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>Membres ({members.length})</Typography>
            </Box>
            <List disablePadding>
              {members.map((member) => (
                <ListItem key={member.id} disablePadding sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <UPFAvatar firstName={member.user.firstName} lastName={member.user.lastName} size="small" />
                    <ListItemText
                      primary={`${member.user.firstName} ${member.user.lastName}`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    />
                    <UPFChip label={member.role} size="small" colorVariant={roleColor[member.role] || 'info'} />
                  </Box>
                </ListItem>
              ))}
            </List>
          </UPFCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GroupDetailPage;
