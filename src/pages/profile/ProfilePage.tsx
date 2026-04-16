/**
 * ProfilePage — Profil utilisateur (propre ou public d'un autre étudiant)
 *
 * Comportement :
 *  - Sans :id → profil de l'utilisateur connecté (adapté selon le rôle)
 *  - Avec :id → profil public d'un autre étudiant (avec boutons Suivre / Message)
 *
 * Champs par rôle :
 *  - STUDENT : filière, année, bio, épreuves partagées, groupes
 *  - PROFESSOR : département, titre, cours
 *  - ADMIN : niveau admin
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Tabs, Tab, useTheme, alpha, Chip, Skeleton, IconButton,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFAvatar from '../../components/ui/UPFAvatar';
import UPFChip from '../../components/ui/UPFChip';
import UPFButton from '../../components/ui/UPFButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile } from '../../services/userService';
import { getMyExams, deleteExam } from '../../services/examService';
import { followUser, unfollowUser, checkFollowStatus } from '../../services/followService';
import type { StudentProfileFrontend, ExamResponseDto } from '../../types';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState(0);

  // Profil externe (autre étudiant)
  const [externalProfile, setExternalProfile] = useState<StudentProfileFrontend | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Exams pour le profil propre
  const [myExams, setMyExams] = useState<ExamResponseDto[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);

  const isOwnProfile = !id || String(id) === String(user?.id);

  useEffect(() => {
    if (!isOwnProfile && id) {
      setLoadingProfile(true);
      getUserProfile(id)
        .then((profile) => setExternalProfile(profile))
        .catch(() => setExternalProfile(null))
        .finally(() => setLoadingProfile(false));

      // Vérifier si on suit déjà cet étudiant
      checkFollowStatus(id)
        .then((status) => setIsFollowing(status))
        .catch(() => setIsFollowing(false));
    } else if (isOwnProfile && user?.role === 'STUDENT') {
      setLoadingExams(true);
      getMyExams()
        .then(res => setMyExams(res.content || []))
        .catch(() => setMyExams([]))
        .finally(() => setLoadingExams(false));
    }
  }, [id, isOwnProfile, user?.role]);

  const handleFollow = async () => {
    if (!id) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(id);
        setIsFollowing(false);
      } else {
        await followUser(id);
        setIsFollowing(true);
      }
    } catch {
      /* ignore */
    } finally {
      setFollowLoading(false);
    }
  };

  // Données du profil à afficher
  const displayProfile = isOwnProfile ? user : externalProfile;

  if (!user) return <LoadingSpinner fullPage />;
  if (!isOwnProfile && loadingProfile) return <LoadingSpinner fullPage />;

  // ── Rendu pour un profil d'étudiant externe ──
  if (!isOwnProfile) {
    if (!externalProfile) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PersonRoundedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} mb={1}>
            Profil introuvable
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Ce profil n'existe pas ou n'est pas public.
          </Typography>
          <UPFButton variant="outlined" onClick={() => navigate('/student/network')}>
            Revenir au réseau
          </UPFButton>
        </Box>
      );
    }

    return (
      <Box>
        {/* Bannière */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
            borderRadius: 4, p: 0, mb: 4, position: 'relative', overflow: 'hidden',
          }}
        >
          <Box sx={{ height: 140, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', bgcolor: alpha('#fff', 0.05) }} />
          </Box>
          <Box sx={{ px: 4, pb: 3, mt: -6, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, flexWrap: 'wrap' }}>
              <UPFAvatar
                firstName={externalProfile.firstName}
                lastName={externalProfile.lastName}
                src={externalProfile.profilePictureUrl ?? undefined}
                size="large"
                sx={{ width: 96, height: 96, fontSize: '2rem', border: `4px solid ${theme.palette.background.paper}`, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
              />
              <Box sx={{ flex: 1, color: '#fff', mb: 1 }}>
                <Typography variant="h4" fontWeight={700}>
                  {externalProfile.firstName} {externalProfile.lastName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SchoolRoundedIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      {externalProfile.major} — Année {externalProfile.currentYear}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {/* Actions : Suivre + Envoyer un message */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <UPFButton
                  variant="contained"
                  size="small"
                  startIcon={isFollowing ? <PersonRemoveRoundedIcon /> : <PersonAddRoundedIcon />}
                  onClick={handleFollow}
                  disabled={followLoading}
                  sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.3), boxShadow: 'none' } }}
                >
                  {isFollowing ? 'Ne plus suivre' : 'Suivre'}
                </UPFButton>
                <UPFButton
                  variant="outlined"
                  size="small"
                  startIcon={<MessageRoundedIcon />}
                  onClick={() => navigate(`/student/messages/${id}`)}
                  sx={{ borderColor: alpha('#fff', 0.3), color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: alpha('#fff', 0.1) } }}
                >
                  Message
                </UPFButton>
              </Box>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            {externalProfile.bio && (
              <UPFCard noHover sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={1}>À propos</Typography>
                <Typography variant="body1" color="text.secondary">{externalProfile.bio}</Typography>
              </UPFCard>
            )}
            <UPFCard noHover>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Épreuves partagées" icon={<DescriptionRoundedIcon />} iconPosition="start" sx={{ textTransform: 'none' }} />
                <Tab label="Groupes" icon={<GroupsRoundedIcon />} iconPosition="start" sx={{ textTransform: 'none' }} />
              </Tabs>
              {tab === 0 && (
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <DescriptionRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">Épreuves partagées par {externalProfile.firstName}</Typography>
                </Box>
              )}
              {tab === 1 && (
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <GroupsRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">Groupes publics de {externalProfile.firstName}</Typography>
                </Box>
              )}
            </UPFCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <UPFCard noHover>
              <Typography variant="h6" fontWeight={600} mb={2}>Informations</Typography>
              {[
                { label: 'Email', value: externalProfile.email, icon: <EmailRoundedIcon fontSize="small" /> },
                { label: 'Filière', value: externalProfile.major, icon: <SchoolRoundedIcon fontSize="small" /> },
                { label: 'Année', value: `${externalProfile.currentYear}ème année`, icon: <CalendarTodayRoundedIcon fontSize="small" /> },
              ].map((info) => (
                <Box key={info.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ color: 'primary.main' }}>{info.icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{info.label}</Typography>
                    <Typography variant="body2" fontWeight={500}>{info.value}</Typography>
                  </Box>
                </Box>
              ))}
            </UPFCard>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // ── Rendu pour le profil propre (selon le rôle) ──
  const role = user.role;

  // Profil étudiant (propre)
  if (role === 'STUDENT') {
    const studentData = user.profileData?.studentProfile;
    return (
      <Box>
        <Box sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          borderRadius: 4, p: 0, mb: 4, position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{ height: 140, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', bgcolor: alpha('#fff', 0.05) }} />
          </Box>
          <Box sx={{ px: 4, pb: 3, mt: -6, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, flexWrap: 'wrap' }}>
              <UPFAvatar firstName={user.firstName} lastName={user.lastName} src={user.avatarUrl} size="large"
                sx={{ width: 96, height: 96, fontSize: '2rem', border: `4px solid ${theme.palette.background.paper}`, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }} />
              <Box sx={{ flex: 1, color: '#fff', mb: 1 }}>
                <Typography variant="h4" fontWeight={700}>{user.firstName} {user.lastName}</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SchoolRoundedIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      {studentData?.major || (user as any).major || 'Filière'} — Année {studentData?.currentYear || (user as any).currentYear || ''}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <UPFButton variant="contained" startIcon={<EditRoundedIcon />} onClick={() => navigate('/student/profile/edit')}
                sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.3), boxShadow: 'none' } }}>
                Modifier
              </UPFButton>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <UPFCard noHover sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={1}>À propos</Typography>
              <Typography variant="body1" color="text.secondary">
                {studentData?.bio || (user as any).bio || 'Ajoutez une biographie pour vous présenter à vos camarades.'}
              </Typography>
            </UPFCard>
            <UPFCard noHover>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Épreuves partagées" icon={<DescriptionRoundedIcon />} iconPosition="start" sx={{ textTransform: 'none' }} />
                <Tab label="Groupes" icon={<GroupsRoundedIcon />} iconPosition="start" sx={{ textTransform: 'none' }} />
              </Tabs>
              {tab === 0 && (
                <Box sx={{ py: 2 }}>
                  {loadingExams ? (
                    <LoadingSpinner />
                  ) : myExams.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {myExams.map(exam => (
                        <UPFCard key={exam.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>{exam.title}</Typography>
                            <Typography variant="body2" color="text.secondary">{exam.examType} - {exam.academicYear}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <UPFButton size="small" variant="outlined" onClick={() => navigate(`/student/exams/${exam.id}`)}>Voir</UPFButton>
                            <IconButton size="small" color="error" onClick={async () => {
                              if (window.confirm('Voulez-vous vraiment supprimer cette épreuve ?')) {
                                try {
                                  await deleteExam(exam.id);
                                  setMyExams(prev => prev.filter(e => e.id !== exam.id));
                                } catch (e) {
                                  alert('Erreur lors de la suppression.');
                                }
                              }
                            }}>
                              <DeleteRoundedIcon />
                            </IconButton>
                          </Box>
                        </UPFCard>
                      ))}
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <UPFButton variant="outlined" size="small" onClick={() => navigate('/student/exams/upload')}>
                          Déposer une autre épreuve
                        </UPFButton>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <DescriptionRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" mb={2}>Vos épreuves partagées apparaîtront ici.</Typography>
                      <UPFButton variant="outlined" size="small" onClick={() => navigate('/student/exams/upload')}>
                        Déposer une épreuve
                      </UPFButton>
                    </Box>
                  )}
                </Box>
              )}
              {tab === 1 && (
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <GroupsRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" mb={2}>Vos groupes apparaîtront ici.</Typography>
                  <UPFButton variant="outlined" size="small" onClick={() => navigate('/student/groups')}>
                    Explorer les groupes
                  </UPFButton>
                </Box>
              )}
            </UPFCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <UPFCard noHover sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Informations</Typography>
              {[
                { label: 'Email', value: user.email, icon: <EmailRoundedIcon fontSize="small" /> },
                { label: 'Filière', value: studentData?.major || (user as any).major || '—', icon: <SchoolRoundedIcon fontSize="small" /> },
                { label: 'Année', value: `${studentData?.currentYear || (user as any).currentYear || '—'}ème année`, icon: <CalendarTodayRoundedIcon fontSize="small" /> },
                { label: 'Visibilité', value: studentData?.isProfilePublic !== false ? 'Profil public' : 'Profil privé', icon: <PersonRoundedIcon fontSize="small" /> },
              ].map((info) => (
                <Box key={info.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ color: 'primary.main' }}>{info.icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{info.label}</Typography>
                    <Typography variant="body2" fontWeight={500}>{info.value}</Typography>
                  </Box>
                </Box>
              ))}
            </UPFCard>
            <UPFCard noHover>
              <Typography variant="h6" fontWeight={600} mb={2}>Statistiques</Typography>
              {[
                { label: 'Épreuves partagées', value: '—' },
                { label: 'Groupes rejoints', value: '—' },
                { label: 'Téléchargements reçus', value: '—' },
              ].map((stat) => (
                <Box key={stat.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                  <Typography variant="body2" fontWeight={600} color="primary.main">{stat.value}</Typography>
                </Box>
              ))}
            </UPFCard>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Profil professeur (propre)
  if (role === 'PROFESSOR') {
    const profData = user.profileData?.professorProfile;
    return (
      <Box>
        <Box sx={{
          background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
          borderRadius: 4, p: 0, mb: 4, position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{ height: 140, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', bgcolor: alpha('#fff', 0.05) }} />
          </Box>
          <Box sx={{ px: 4, pb: 3, mt: -6, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, flexWrap: 'wrap' }}>
              <UPFAvatar firstName={user.firstName} lastName={user.lastName} src={user.avatarUrl} size="large"
                sx={{ width: 96, height: 96, fontSize: '2rem', border: `4px solid ${theme.palette.background.paper}`, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }} />
              <Box sx={{ flex: 1, color: '#fff', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Chip label="Professeur" size="small" sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', fontWeight: 600 }} />
                  {profData?.title && <Chip label={profData.title} size="small" sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff' }} />}
                </Box>
                <Typography variant="h4" fontWeight={700}>{profData?.title ? `${profData.title} ` : ''}{user.firstName} {user.lastName}</Typography>
                {profData?.department && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <WorkRoundedIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>{profData.department}</Typography>
                  </Box>
                )}
              </Box>
              <UPFButton variant="contained" startIcon={<EditRoundedIcon />} onClick={() => navigate('/professor/profile/edit')}
                sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.3), boxShadow: 'none' } }}>
                Modifier
              </UPFButton>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <UPFCard noHover sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={1}>Biographie</Typography>
              <Typography variant="body1" color="text.secondary">
                {profData?.bio || 'Ajoutez une biographie pour vous présenter à vos étudiants.'}
              </Typography>
            </UPFCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <UPFCard noHover>
              <Typography variant="h6" fontWeight={600} mb={2}>Coordonnées</Typography>
              {[
                { label: 'Email', value: user.email, icon: <EmailRoundedIcon fontSize="small" /> },
                { label: 'Département', value: profData?.department || '—', icon: <WorkRoundedIcon fontSize="small" /> },
                { label: 'Titre', value: profData?.title || '—', icon: <AdminPanelSettingsRoundedIcon fontSize="small" /> },
              ].map((info) => (
                <Box key={info.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ color: 'secondary.main' }}>{info.icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{info.label}</Typography>
                    <Typography variant="body2" fontWeight={500}>{info.value}</Typography>
                  </Box>
                </Box>
              ))}
            </UPFCard>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Profil admin
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    const adminData = user.profileData?.adminProfile;
    return (
      <Box>
        <Box sx={{
          background: `linear-gradient(135deg, #1e293b 0%, #334155 100%)`,
          borderRadius: 4, p: 0, mb: 4, position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{ height: 140, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', bgcolor: alpha('#fff', 0.05) }} />
          </Box>
          <Box sx={{ px: 4, pb: 3, mt: -6, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, flexWrap: 'wrap' }}>
              <UPFAvatar firstName={user.firstName} lastName={user.lastName} src={user.avatarUrl} size="large"
                sx={{ width: 96, height: 96, fontSize: '2rem', border: `4px solid ${theme.palette.background.paper}`, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }} />
              <Box sx={{ flex: 1, color: '#fff', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Chip label={adminData?.adminLevel || 'ADMIN'} size="small"
                    sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', fontWeight: 600 }} />
                </Box>
                <Typography variant="h4" fontWeight={700}>{user.firstName} {user.lastName}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>{user.email}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <UPFCard noHover>
              <Typography variant="h6" fontWeight={600} mb={2}>Informations du compte</Typography>
              {[
                { label: 'Email', value: user.email, icon: <EmailRoundedIcon fontSize="small" /> },
                { label: 'Niveau', value: adminData?.adminLevel || user.role, icon: <AdminPanelSettingsRoundedIcon fontSize="small" /> },
              ].map((info) => (
                <Box key={info.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ color: 'text.secondary' }}>{info.icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{info.label}</Typography>
                    <Typography variant="body2" fontWeight={500}>{info.value}</Typography>
                  </Box>
                </Box>
              ))}
            </UPFCard>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return <LoadingSpinner fullPage />;
};

export default ProfilePage;
