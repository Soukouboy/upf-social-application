/**
 * ProfessorAttendanceSessionPage — Prise de présences pour une séance
 *
 * Interface tablette-friendly permettant au professeur de :
 *   - Voir la liste des étudiants inscrits au cours
 *   - Toggler le statut de chaque étudiant (PRESENT / LATE / ABSENT / EXCUSED)
 *   - Valider toutes les présences en un clic (bulk)
 *   - Verrouiller la séance une fois terminé
 */
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, useTheme, alpha, Alert, Chip,
  Grid, Breadcrumbs, Link, IconButton, Tooltip,
  LinearProgress, Divider,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFAvatar from '../../components/ui/UPFAvatar';
import UPFModal from '../../components/ui/UPFModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { AttendanceStatus, BulkAttendanceItem, SessionResponse } from '../../types';
import type { StudentProfileSummary } from '../../services/professorService';
import { getCourseStudents } from '../../services/professorService';
import { bulkMarkAttendance, lockSession } from '../../services/attendanceService';

// ─── Configuration des statuts ────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

const STATUS_CONFIG: Record<AttendanceStatus, StatusConfig> = {
  PRESENT: {
    label: 'Présent',
    color: '#10B981',
    bgColor: '#D1FAE5',
    icon: <CheckCircleRoundedIcon />,
  },
  ABSENT: {
    label: 'Absent',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    icon: <CancelRoundedIcon />,
  },
  LATE: {
    label: 'Retard',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: <AccessTimeRoundedIcon />,
  },
  EXCUSED: {
    label: 'Excusé',
    color: '#6366F1',
    bgColor: '#EDE9FE',
    icon: <AssignmentIndRoundedIcon />,
  },
};

const STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

// ─── Données mock ─────────────────────────────────────────────────────────────

const MOCK_STUDENTS: StudentProfileSummary[] = [
  { id: 'stu-001', firstName: 'Amine', lastName: 'Benali', email: 'a.benali@upf.ac.ma', major: 'Génie Informatique', currentYear: 3 },
  { id: 'stu-002', firstName: 'Sarah', lastName: 'Alaoui', email: 's.alaoui@upf.ac.ma', major: 'Génie Informatique', currentYear: 3 },
  { id: 'stu-003', firstName: 'Youssef', lastName: 'Errami', email: 'y.errami@upf.ac.ma', major: 'Génie Informatique', currentYear: 3 },
  { id: 'stu-004', firstName: 'Nadia', lastName: 'Chafik', email: 'n.chafik@upf.ac.ma', major: 'Génie Informatique', currentYear: 3 },
  { id: 'stu-005', firstName: 'Omar', lastName: 'Tazi', email: 'o.tazi@upf.ac.ma', major: 'Génie Informatique', currentYear: 3 },
  { id: 'stu-006', firstName: 'Fatima', lastName: 'Moussaoui', email: 'f.moussaoui@upf.ac.ma', major: 'Génie Informatique', currentYear: 3 },
  { id: 'stu-007', firstName: 'Karim', lastName: 'Belkadi', email: 'k.belkadi@upf.ac.ma', major: 'Génie Informatique', currentYear: 3 },
  { id: 'stu-008', firstName: 'Leila', lastName: 'Rahimi', email: 'l.rahimi@upf.ac.ma', major: 'Génie Informatique', currentYear: 3 },
];

// ─── Composant ────────────────────────────────────────────────────────────────

const ProfessorAttendanceSessionPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();

  // Données passées via navigate state
  const locationState = location.state as {
    session?: SessionResponse;
    courseTitle?: string;
    courseId?: string;
  } | null;

  const courseTitle = locationState?.courseTitle ?? 'Cours';
  const courseId = locationState?.courseId ?? '';
  const session = locationState?.session;

  const [students, setStudents] = useState<StudentProfileSummary[]>([]);
  // Map: studentId → enrollmentId (dans un vrai scénario vient de l'enrollment)
  // Pour simplifier on utilise l'id étudiant comme enrollmentId
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locking, setLocking] = useState(false);
  const [lockConfirmOpen, setLockConfirmOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(session?.isLocked ?? false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getCourseStudents(courseId);
        setStudents(data);
        // Initialiser tous les étudiants à PRESENT par défaut
        const init: Record<string, AttendanceStatus> = {};
        data.forEach((s) => { init[s.id] = 'PRESENT'; });
        setStatusMap(init);
      } catch {
        setStudents(MOCK_STUDENTS);
        const init: Record<string, AttendanceStatus> = {};
        MOCK_STUDENTS.forEach((s) => { init[s.id] = 'PRESENT'; });
        setStatusMap(init);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetch();
    else {
      // mode démo sans courseId
      setStudents(MOCK_STUDENTS);
      const init: Record<string, AttendanceStatus> = {};
      MOCK_STUDENTS.forEach((s) => { init[s.id] = 'PRESENT'; });
      setStatusMap(init);
      setLoading(false);
    }
  }, [courseId]);

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  // Marquer tous comme présents
  const markAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    students.forEach((s) => { next[s.id] = status; });
    setStatusMap(next);
  };

  const handleSave = async () => {
    if (!sessionId) return;
    setSaving(true);
    try {
      const attendances: BulkAttendanceItem[] = students.map((s) => ({
        enrollmentId: s.id, // En production, utiliser le vrai enrollmentId
        status: statusMap[s.id] ?? 'ABSENT',
      }));
      await bulkMarkAttendance(sessionId, { attendances });
      setSuccessMsg('Présences enregistrées avec succès !');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch {
      setErrorMsg('Erreur lors de l\'enregistrement. Veuillez réessayer.');
      setTimeout(() => setErrorMsg(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  const handleLock = async () => {
    if (!sessionId) return;
    setLocking(true);
    try {
      await lockSession(sessionId);
      setIsLocked(true);
      setLockConfirmOpen(false);
      setSuccessMsg('Séance verrouillée — les présences ne peuvent plus être modifiées.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      setErrorMsg('Erreur lors du verrouillage.');
      setTimeout(() => setErrorMsg(null), 3500);
    } finally {
      setLocking(false);
    }
  };

  // Compteurs
  const counts = students.reduce(
    (acc, s) => { acc[statusMap[s.id] ?? 'ABSENT']++; return acc; },
    { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 } as Record<AttendanceStatus, number>
  );
  const progressPct = students.length > 0 ? Math.round((counts.PRESENT / students.length) * 100) : 0;

  if (loading) return <LoadingSpinner fullPage message="Chargement des étudiants…" />;

  return (
    <Box>
      {/* ── Breadcrumb + retour ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/professor/attendance')}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Breadcrumbs>
          <Link component="button" variant="body2" onClick={() => navigate('/professor/attendance')} underline="hover" color="text.secondary">
            Présences
          </Link>
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            Séance {session?.sessionNumber ?? ''}
          </Typography>
        </Breadcrumbs>
      </Box>

      {successMsg && <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>{errorMsg}</Alert>}

      {/* ── Header séance ── */}
      <Box sx={{
        background: isLocked
          ? `linear-gradient(135deg, #6B7280 0%, #4B5563 100%)`
          : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
        borderRadius: 4, p: 4, mb: 4, color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', bgcolor: alpha('#fff', 0.05) }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} mb={0.5}>{courseTitle}</Typography>
              <Typography variant="body1" sx={{ opacity: 0.85 }}>
                Séance {session?.sessionNumber ?? ''} — {session?.sessionDate ? new Date(session.sessionDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
              </Typography>
              {session?.description && (
                <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>{session.description}</Typography>
              )}
            </Box>
            {isLocked && (
              <Chip
                icon={<LockRoundedIcon />}
                label="Séance verrouillée"
                sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', fontWeight: 600 }}
              />
            )}
          </Box>

          {/* Barre de progression présents */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {counts.PRESENT} présent{counts.PRESENT > 1 ? 's' : ''} sur {students.length}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>{progressPct}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPct}
              sx={{
                height: 6, borderRadius: 3,
                bgcolor: alpha('#fff', 0.2),
                '& .MuiLinearProgress-bar': { bgcolor: '#fff', borderRadius: 3 },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* ── Compteurs rapides ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {STATUSES.map((status) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <Grid size={{ xs: 3 }} key={status}>
              <UPFCard sx={{ textAlign: 'center', cursor: 'pointer', border: `2px solid transparent`, '&:hover': { borderColor: cfg.color } }}
                onClick={() => markAll(status)}>
                <Tooltip title={`Marquer tous comme "${cfg.label}"`} placement="top">
                  <Box>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: cfg.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, mx: 'auto', mb: 1 }}>
                      {cfg.icon}
                    </Box>
                    <Typography variant="h5" fontWeight={700} sx={{ color: cfg.color }}>{counts[status]}</Typography>
                    <Typography variant="caption" color="text.secondary">{cfg.label}</Typography>
                  </Box>
                </Tooltip>
              </UPFCard>
            </Grid>
          );
        })}
      </Grid>
      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 2, textAlign: 'center' }}>
        💡 Cliquer sur un compteur marque tous les étudiants avec ce statut
      </Typography>

      {/* ── Liste des étudiants ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleRoundedIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={600}>Liste d'appel ({students.length} étudiants)</Typography>
        </Box>
        {!isLocked && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <UPFButton variant="outlined" size="small" startIcon={<SaveRoundedIcon />} loading={saving} onClick={handleSave}>
              Enregistrer
            </UPFButton>
            <UPFButton
              variant="contained"
              size="small"
              color="error"
              startIcon={<LockRoundedIcon />}
              onClick={() => setLockConfirmOpen(true)}
            >
              Verrouiller la séance
            </UPFButton>
          </Box>
        )}
      </Box>

      <UPFCard noHover padding={0}>
        {students.map((student, idx) => {
          const currentStatus = statusMap[student.id] ?? 'ABSENT';
          const cfg = STATUS_CONFIG[currentStatus];
          return (
            <React.Fragment key={student.id}>
              <Box sx={{
                display: 'flex', alignItems: 'center', px: 3, py: 2,
                gap: 2, flexWrap: 'wrap',
                bgcolor: isLocked ? alpha(cfg.color, 0.03) : 'transparent',
                transition: 'background-color 0.2s ease',
              }}>
                {/* Numéro + Avatar + Nom */}
                <Typography variant="body2" color="text.disabled" sx={{ minWidth: 24, fontWeight: 600 }}>
                  {idx + 1}
                </Typography>
                <UPFAvatar firstName={student.firstName} lastName={student.lastName} size="small" />
                <Box sx={{ flex: 1, minWidth: 160 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {student.firstName} {student.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {student.major} · {student.currentYear}ème année
                  </Typography>
                </Box>

                {/* Boutons de statut */}
                {isLocked ? (
                  <Chip
                    size="small"
                    label={cfg.label}
                    sx={{ bgcolor: cfg.bgColor, color: cfg.color, fontWeight: 600, border: `1px solid ${cfg.color}30` }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    {STATUSES.map((status) => {
                      const s = STATUS_CONFIG[status];
                      const isSelected = currentStatus === status;
                      return (
                        <Box
                          key={status}
                          component="button"
                          onClick={() => setStudentStatus(student.id, status)}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 0.5,
                            px: 1.5, py: 0.6, borderRadius: '20px', border: 'none',
                            cursor: 'pointer', fontWeight: isSelected ? 700 : 400,
                            fontSize: '0.78rem', transition: 'all 0.15s ease',
                            bgcolor: isSelected ? s.bgColor : alpha(s.color, 0.07),
                            color: isSelected ? s.color : alpha(s.color, 0.6),
                            boxShadow: isSelected ? `0 0 0 2px ${s.color}` : 'none',
                            '&:hover': { bgcolor: s.bgColor, color: s.color },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', '& > svg': { fontSize: 14 } }}>
                            {s.icon}
                          </Box>
                          {s.label}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
              {idx < students.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </UPFCard>

      {/* ── Bouton bas de page ── */}
      {!isLocked && students.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <UPFButton variant="outlined" startIcon={<SaveRoundedIcon />} loading={saving} onClick={handleSave}>
            Enregistrer les présences
          </UPFButton>
          <UPFButton
            variant="contained"
            color="error"
            startIcon={<LockRoundedIcon />}
            onClick={() => setLockConfirmOpen(true)}
          >
            Verrouiller et terminer
          </UPFButton>
        </Box>
      )}

      {/* ── Modal confirmation verrouillage ── */}
      <UPFModal
        open={lockConfirmOpen}
        onClose={() => setLockConfirmOpen(false)}
        title="⚠️ Verrouiller la séance ?"
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setLockConfirmOpen(false)}>Annuler</UPFButton>
            <UPFButton variant="contained" color="error" loading={locking} onClick={handleLock}>
              Oui, verrouiller
            </UPFButton>
          </>
        }
      >
        <Typography variant="body2" color="text.secondary">
          Une fois verrouillée, <strong>les présences ne pourront plus être modifiées</strong>.
          Cette action est irréversible. Assurez-vous que toutes les présences sont correctement enregistrées.
        </Typography>
      </UPFModal>
    </Box>
  );
};

export default ProfessorAttendanceSessionPage;
