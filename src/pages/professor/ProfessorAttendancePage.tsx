/**
 * ProfessorAttendancePage — Gestion des présences par cours
 *
 * Permet au professeur de :
 *   1. Sélectionner un de ses cours
 *   2. Voir la liste des séances existantes
 *   3. Créer une nouvelle séance (modal)
 *   4. Accéder à une séance pour prendre les présences
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, MenuItem, TextField, useTheme, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Alert,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFChip from '../../components/ui/UPFChip';
import UPFModal from '../../components/ui/UPFModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { CourseSummary, SessionResponse } from '../../types';
import { getMyCourses } from '../../services/professorService';
import { getCourseSessions, createSession } from '../../services/attendanceService';

// ─── Données mock réalistes (fallback si backend indisponible) ────────────────

const MOCK_SESSIONS: SessionResponse[] = [
  {
    id: 'sess-001', courseId: 'course-001', sessionDate: '2024-01-15',
    sessionNumber: 1, description: 'Introduction au cours', isLocked: true,
    lockedAt: '2024-01-15T17:00:00', createdAt: '2024-01-15T08:00:00',
  },
  {
    id: 'sess-002', courseId: 'course-001', sessionDate: '2024-01-22',
    sessionNumber: 2, description: 'Chapitre 1 — Algorithmique de base', isLocked: true,
    lockedAt: '2024-01-22T17:00:00', createdAt: '2024-01-22T08:00:00',
  },
  {
    id: 'sess-003', courseId: 'course-001', sessionDate: '2024-01-29',
    sessionNumber: 3, description: 'TP1 — Implémentation tri fusion', isLocked: false,
    lockedAt: null, createdAt: '2024-01-29T08:00:00',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

const todayIso = () => new Date().toISOString().split('T')[0];

// ─── Composant ────────────────────────────────────────────────────────────────

const ProfessorAttendancePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Modal nouvelle séance
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [sessionDate, setSessionDate] = useState(todayIso());
  const [sessionNumber, setSessionNumber] = useState(1);
  const [sessionDescription, setSessionDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Chargement des cours
  useEffect(() => {
    const fetch = async () => {
      setLoadingCourses(true);
      try {
        const list = await getMyCourses();
        setCourses(list);
        if (list.length > 0) setSelectedCourseId(String(list[0].id));
      } catch {
        // fallback mock
        const mock: CourseSummary[] = [
          { id: 'course-001', code: 'INF301', title: 'Algorithmique avancée', major: 'Génie Informatique', year: 3, semester: 5, credits: 4, professorName: 'Pr. Chraibi', isActive: true },
          { id: 'course-002', code: 'INF302', title: 'Programmation Web', major: 'Génie Informatique', year: 3, semester: 5, credits: 3, professorName: 'Pr. Chraibi', isActive: true },
        ];
        setCourses(mock);
        setSelectedCourseId('course-001');
      } finally {
        setLoadingCourses(false);
      }
    };
    fetch();
  }, []);

  // Chargement des séances quand le cours change
  useEffect(() => {
    if (!selectedCourseId) return;
    const fetch = async () => {
      setLoadingSessions(true);
      try {
        const data = await getCourseSessions(selectedCourseId);
        setSessions(data);
      } catch {
        setSessions(MOCK_SESSIONS.filter((s) => s.courseId === selectedCourseId || selectedCourseId === 'course-001'));
      } finally {
        setLoadingSessions(false);
      }
    };
    fetch();
  }, [selectedCourseId]);

  // Créer une séance
  const handleCreateSession = async () => {
    if (!selectedCourseId || !sessionDate || sessionNumber < 1) return;
    setCreateLoading(true);
    try {
      const created = await createSession(selectedCourseId, {
        sessionDate,
        sessionNumber,
        description: sessionDescription || undefined,
      });
      setSessions((prev) => [...prev, created]);
      setCreateOpen(false);
      setSessionDescription('');
      setSessionNumber(sessions.length + 2);
      setSuccessMsg('Séance créée avec succès !');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch {
      setErrorMsg('Erreur lors de la création de la séance.');
      setTimeout(() => setErrorMsg(null), 3500);
    } finally {
      setCreateLoading(false);
    }
  };

  const openCreate = () => {
    setSessionNumber(sessions.length + 1);
    setSessionDate(todayIso());
    setSessionDescription('');
    setCreateOpen(true);
  };

  const selectedCourse = courses.find((c) => String(c.id) === selectedCourseId);

  if (loadingCourses) return <LoadingSpinner fullPage message="Chargement des cours…" />;

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
        borderRadius: 4, p: { xs: 3, sm: 4 }, mb: 4, color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', bgcolor: alpha('#fff', 0.06) }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <HowToRegRoundedIcon sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={700}>Gestion des Présences</Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            Créez des séances et enregistrez les présences de vos étudiants
          </Typography>
        </Box>
      </Box>

      {successMsg && <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>{errorMsg}</Alert>}

      {/* ── Sélecteur de cours ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <UPFCard noHover>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              📚 Sélectionner un cours
            </Typography>
            {courses.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Aucun cours assigné</Typography>
            ) : (
              <TextField
                select fullWidth size="small"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                label="Cours"
              >
                {courses.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.code} — {c.title}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </UPFCard>
        </Grid>

        {/* Stats rapides */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            {[
              { label: 'Séances total', value: sessions.length, color: '#3B82F6', icon: <EventNoteRoundedIcon /> },
              { label: 'Séances verrouillées', value: sessions.filter((s) => s.isLocked).length, color: '#10B981', icon: <LockRoundedIcon /> },
              { label: 'Séances ouvertes', value: sessions.filter((s) => !s.isLocked).length, color: '#F59E0B', icon: <LockOpenRoundedIcon /> },
            ].map((stat) => (
              <Grid size={{ xs: 4 }} key={stat.label}>
                <UPFCard sx={{ textAlign: 'center', p: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(stat.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, mx: 'auto', mb: 1 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h5" fontWeight={700} color={stat.color}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>{stat.label}</Typography>
                </UPFCard>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* ── Table des séances ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChecklistRoundedIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={600}>
            Séances — {selectedCourse?.title ?? '—'}
          </Typography>
        </Box>
        <UPFButton
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={openCreate}
          disabled={!selectedCourseId}
        >
          Nouvelle séance
        </UPFButton>
      </Box>

      <UPFCard noHover padding={0}>
        {loadingSessions ? (
          <Box sx={{ p: 4, textAlign: 'center' }}><LoadingSpinner /></Box>
        ) : sessions.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <EventNoteRoundedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={500}>Aucune séance pour ce cours</Typography>
            <Typography variant="body2" color="text.disabled" mb={3}>Commencez par créer une séance pour enregistrer les présences</Typography>
            <UPFButton variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
              Créer la première séance
            </UPFButton>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  <TableCell sx={{ fontWeight: 600 }}>N°</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions
                  .slice()
                  .sort((a, b) => a.sessionNumber - b.sessionNumber)
                  .map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell>
                        <Box sx={{
                          width: 32, height: 32, borderRadius: '8px',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, color: 'primary.main', fontSize: '0.85rem',
                        }}>
                          {s.sessionNumber}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {formatDate(s.sessionDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {s.description || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {s.isLocked ? (
                          <UPFChip
                            label="Verrouillée"
                            size="small"
                            colorVariant="error"
                            icon={<LockRoundedIcon sx={{ fontSize: '14px !important' }} />}
                          />
                        ) : (
                          <UPFChip
                            label="Ouverte"
                            size="small"
                            colorVariant="success"
                            icon={<LockOpenRoundedIcon sx={{ fontSize: '14px !important' }} />}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {!s.isLocked && (
                          <Tooltip title="Prendre les présences">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/professor/attendance/${s.id}`, { state: { session: s, courseTitle: selectedCourse?.title, courseId: selectedCourseId } })}
                            >
                              <ArrowForwardRoundedIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {s.isLocked && (
                          <Tooltip title="Séance verrouillée — consultation uniquement">
                            <IconButton size="small" disabled>
                              <LockRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </UPFCard>

      {/* ── Modal Création Séance ── */}
      <UPFModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Créer une nouvelle séance"
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setCreateOpen(false)}>Annuler</UPFButton>
            <UPFButton
              variant="contained"
              color="success"
              loading={createLoading}
              disabled={!sessionDate || sessionNumber < 1}
              onClick={handleCreateSession}
            >
              Créer la séance
            </UPFButton>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Date de la séance"
            type="date"
            fullWidth
            size="small"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Numéro de séance"
            type="number"
            fullWidth
            size="small"
            value={sessionNumber}
            onChange={(e) => setSessionNumber(Math.max(1, Number(e.target.value)))}
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Description (optionnel)"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={sessionDescription}
            onChange={(e) => setSessionDescription(e.target.value.slice(0, 300))}
            helperText={`${sessionDescription.length}/300 caractères`}
          />
        </Box>
      </UPFModal>
    </Box>
  );
};

export default ProfessorAttendancePage;
