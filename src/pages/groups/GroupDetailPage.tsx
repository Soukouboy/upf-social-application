/**
 * GroupDetailPage — Détail d'un groupe avec gestion des demandes d'adhésion
 *
 * Fonctionnalités :
 *  - Affichage info groupe (public / privé)
 *  - Rejoindre (public) ou Demander à rejoindre (privé)
 *  - Si admin du groupe : voir et approuver les demandes en attente
 *  - Masquer le bouton "Rejoindre" si déjà membre
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, List, ListItem, ListItemText, IconButton,
  Breadcrumbs, Link, useTheme, alpha, Divider, Alert,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFChip from '../../components/ui/UPFChip';
import UPFButton from '../../components/ui/UPFButton';
import UPFAvatar from '../../components/ui/UPFAvatar';
import UPFModal from '../../components/ui/UPFModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import type { Group, GroupMembership, MembershipStatus } from '../../types';
import { getGroupById, getGroupMembers, joinGroup, requestJoinGroup, updateMemberRole, removeMember } from '../../services/groupService';

const GroupDetailPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [approveModal, setApproveModal] = useState<{ open: boolean; member: GroupMembership | null; action: 'approve' | 'reject' }>({
    open: false, member: null, action: 'approve',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [groupData, membersData] = await Promise.all([
          getGroupById(id),
          getGroupMembers(id),
        ]);
        setGroup(groupData);
        setMembers(membersData);
      } catch {
        setGroup(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage message="Chargement du groupe…" />;
  if (!group) return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h5" fontWeight={600}>Groupe introuvable</Typography>
      <UPFButton variant="outlined" onClick={() => navigate('/student/groups')} sx={{ mt: 2 }}>
        Revenir aux groupes
      </UPFButton>
    </Box>
  );

  // Déterminer le statut de l'utilisateur dans le groupe
  const myMembership = members.find((m: any) =>
    String(m.student?.id) === String(user?.id) ||
    String(m.student?.userId) === String(user?.userId) ||
    String(m.user?.id) === String(user?.id) ||
    String(m.student?.userId) === String(user?.id) ||
    String(m.student?.id) === String(user?.userId) ||
    String(m.studentId) === String(user?.id) ||
    String(m.userId) === String(user?.userId) ||
    String(m.userId) === String(user?.id) ||
    String(m.id) === String(user?.id)
  );
  const isMember = myMembership?.status === 'ACTIVE';
  const isPending = myMembership?.status === 'PENDING';
  const isGroupAdmin = myMembership?.role === 'ADMIN';

  // Membres actifs et en attente
  const activeMembers = members.filter((m) => m.status === 'ACTIVE');
  const pendingMembers = members.filter((m) => m.status === 'PENDING');

  const handleJoin = async () => {
    if (!id) return;
    setActionLoading(true);
    setJoinError(null);
    try {
      if (group.type === 'PUBLIC') {
        await joinGroup(id);
        setJoinSuccess('Vous avez rejoint le groupe avec succès !');
      } else {
        await requestJoinGroup(id);
        setJoinSuccess('Votre demande d\'adhésion a été envoyée. Vous serez notifié lorsqu\'elle sera acceptée.');
      }
      // Recharger les membres
      const updatedMembers = await getGroupMembers(id);
      setMembers(updatedMembers);
    } catch {
      setJoinError("Erreur lors de l'intégration au groupe.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveAction = async () => {
    if (!approveModal.member || !id) return;
    const memberId = (approveModal.member as any).student?.id || (approveModal.member as any).user?.id || (approveModal.member as any).studentId || (approveModal.member as any).userId || (approveModal.member as any).id;
    try {
      if (approveModal.action === 'approve') {
        await updateMemberRole(id as any, memberId, 'MEMBER');
      } else {
        await removeMember(id, memberId);
      }
      const updatedMembers = await getGroupMembers(id);
      setMembers(updatedMembers);
    } catch {
      /* ignore */
    } finally {
      setApproveModal({ open: false, member: null, action: 'approve' });
    }
  };

  const roleColor: Record<string, 'error' | 'secondary' | 'info'> = { ADMIN: 'error', MODERATOR: 'secondary', MEMBER: 'info' };
  const roleLabel: Record<string, string> = { ADMIN: 'Admin', MODERATOR: 'Modérateur', MEMBER: 'Membre' };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/student/groups')}><ArrowBackRoundedIcon /></IconButton>
        <Breadcrumbs>
          <Link component="button" variant="body2" onClick={() => navigate('/student/groups')} underline="hover" color="text.secondary">Groupes</Link>
          <Typography variant="body2" color="text.primary" fontWeight={500}>{group.name}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Alertes */}
      {joinSuccess && <Alert severity="success" onClose={() => setJoinSuccess(null)} sx={{ mb: 3, borderRadius: 2 }}>{joinSuccess}</Alert>}
      {joinError && <Alert severity="error" onClose={() => setJoinError(null)} sx={{ mb: 3, borderRadius: 2 }}>{joinError}</Alert>}

      {/* En-tête du groupe */}
      <Box sx={{
        background: group.type === 'PUBLIC'
          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
          : `linear-gradient(135deg, ${theme.palette.warning.dark} 0%, ${theme.palette.warning.main} 100%)`,
        borderRadius: 4, p: 4, mb: 4, color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', bgcolor: alpha('#fff', 0.05) }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <UPFChip
              label={group.type === 'PUBLIC' ? 'Public' : 'Privé'}
              icon={group.type === 'PUBLIC' ? <PublicRoundedIcon /> : <LockRoundedIcon />}
              sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
            />
            {isMember && <UPFChip label="Membre" sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff' }} />}
            {isPending && <UPFChip label="En attente" icon={<HourglassEmptyRoundedIcon />} sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', '& .MuiChip-icon': { color: '#fff' } }} />}
          </Box>
          <Typography variant="h4" fontWeight={700} mb={1}>{group.name}</Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, mb: 2 }}>{group.description}</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {isMember && (
              <UPFButton variant="contained" startIcon={<ChatRoundedIcon />}
                onClick={() => navigate(`/student/groups/${group.id}/chat`)}
                sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.3), boxShadow: 'none' } }}
              >
                Ouvrir le chat
              </UPFButton>
            )}
            {!isMember && !isPending && (
              <UPFButton variant="outlined" startIcon={group.type === 'PRIVATE' ? <LockRoundedIcon /> : <PersonAddRoundedIcon />}
                onClick={handleJoin} disabled={actionLoading}
                sx={{ borderColor: alpha('#fff', 0.3), color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: alpha('#fff', 0.1) } }}
              >
                {actionLoading
                  ? 'En cours…'
                  : group.type === 'PUBLIC' ? 'Rejoindre' : 'Demander à rejoindre'}
              </UPFButton>
            )}
            {isPending && (
              <UPFChip icon={<HourglassEmptyRoundedIcon />} label="Demande en attente d'approbation"
                sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff', fontSize: '0.85rem', px: 1 }} />
            )}
          </Box>
        </Box>
      </Box>

      {/* Section Admin : Demandes en attente */}
      {isGroupAdmin && pendingMembers.length > 0 && (
        <UPFCard noHover sx={{ mb: 3, border: `1px solid ${alpha(theme.palette.warning.main, 0.4)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <HourglassEmptyRoundedIcon sx={{ color: 'warning.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Demandes en attente ({pendingMembers.length})
            </Typography>
          </Box>
          <List disablePadding>
            {pendingMembers.map((member) => {
              const firstName = (member as any).student?.firstName || (member as any).user?.firstName || (member as any).firstName || 'Utilisateur';
              const lastName = (member as any).student?.lastName || (member as any).user?.lastName || (member as any).lastName || '';
              return (
                <ListItem key={member.id} disablePadding sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <UPFAvatar firstName={firstName} lastName={lastName} size="small" />
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight={500}>{firstName} {lastName}</Typography>}
                      secondary={`Demande envoyée le ${new Date(member.joinedAt).toLocaleDateString('fr-FR')}`}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <UPFButton size="small" variant="contained" color="success" startIcon={<CheckCircleRoundedIcon />}
                        onClick={() => setApproveModal({ open: true, member, action: 'approve' })}>
                        Accepter
                      </UPFButton>
                      <UPFButton size="small" variant="outlined" color="error" startIcon={<CancelRoundedIcon />}
                        onClick={() => setApproveModal({ open: true, member, action: 'reject' })}>
                        Refuser
                      </UPFButton>
                    </Box>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </UPFCard>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <UPFCard noHover>
            <Typography variant="h6" fontWeight={600} mb={2}>À propos</Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>{group.description}</Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight={700} color="primary.main">{group.memberCount}</Typography>
                <Typography variant="caption" color="text.secondary">Membres actifs</Typography>
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} color="secondary.main">
                  {new Date(group.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                </Typography>
                <Typography variant="caption" color="text.secondary">Créé en</Typography>
              </Box>
              {pendingMembers.length > 0 && isGroupAdmin && (
                <Box>
                  <Typography variant="h5" fontWeight={700} color="warning.main">{pendingMembers.length}</Typography>
                  <Typography variant="caption" color="text.secondary">En attente</Typography>
                </Box>
              )}
            </Box>
          </UPFCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <UPFCard noHover>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PeopleRoundedIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>Membres ({activeMembers.length})</Typography>
            </Box>
            <List disablePadding>
              {activeMembers.map((member) => {
                const firstName = (member as any).student?.firstName || (member as any).user?.firstName || (member as any).firstName || 'Utilisateur';
                const lastName = (member as any).student?.lastName || (member as any).user?.lastName || (member as any).lastName || '';
                return (
                  <ListItem key={member.id} disablePadding sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                      <UPFAvatar firstName={firstName} lastName={lastName} size="small" />
                      <ListItemText
                        primary={`${firstName} ${lastName}`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      />
                      <UPFChip label={roleLabel[member.role] || member.role} size="small" colorVariant={roleColor[member.role] || 'info'} />
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </UPFCard>
        </Grid>
      </Grid>

      {/* Modal d'approbation */}
      <UPFModal
        open={approveModal.open}
        onClose={() => setApproveModal({ open: false, member: null, action: 'approve' })}
        title={approveModal.action === 'approve' ? 'Accepter la demande' : 'Refuser la demande'}
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setApproveModal({ open: false, member: null, action: 'approve' })}>
              Annuler
            </UPFButton>
            <UPFButton
              variant="contained"
              color={approveModal.action === 'approve' ? 'primary' : 'error'}
              onClick={handleApproveAction}
            >
              Confirmer
            </UPFButton>
          </>
        }
      >
        <Typography>
          {approveModal.action === 'approve'
            ? `Voulez-vous accepter la demande de ${(approveModal.member as any)?.student?.firstName || (approveModal.member as any)?.user?.firstName || 'cet utilisateur'} ?`
            : `Voulez-vous refuser la demande de ${(approveModal.member as any)?.student?.firstName || (approveModal.member as any)?.user?.firstName || 'cet utilisateur'} ?`}
        </Typography>
      </UPFModal>
    </Box>
  );
};

export default GroupDetailPage;
