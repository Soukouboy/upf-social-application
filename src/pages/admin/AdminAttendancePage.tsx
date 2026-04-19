/**
 * AdminAttendancePage — Rapport de présences (vue administrateur)
 *
 * Permet à l'admin de :
 *   - Sélectionner un cours
 *   - Voir le rapport de présences de tous les étudiants
 *   - Identifier les étudiants éligibles / rattrapages / exclus
 */
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, MenuItem, TextField, useTheme, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Grid, Alert, Tooltip,
} from '@mui/material';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFChip from '../../components/ui/UPFChip';
import UPFAvatar from '../../components/ui/UPFAvatar';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { CourseSummary, AttendanceReportEntry, AttendanceEligibility } from '../../types';
import { getCourseAttendanceReport } from '../../services/attendanceService';
import { getAdminStats } from '../../services/adminService';

// ─── Config éligibilité ───────────────────────────────────────────────────────

const ELIGIBILITY_CONFIG: Record<AttendanceEligibility, { label: string; color: string; bgColor: string; icon: React.ReactNode; description: string }> = {
  ELIGIBLE: {
    label: 'Éligible',
    color: '#10B981',
    bgColor: '#D1FAE5',
    icon: <CheckCircleRoundedIcon />,
    description: 'Taux d\'absence < 30% — peut passer l\'examen normal',
  },
  RATTRAPAGE_ONLY: {
    label: 'Rattrapage',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: <WarningRoundedIcon />,
    description: 'Taux d\'absence 30–50% — examen de rattrapage uniquement',
  },
  EXCLUDED: {
    label: 'Exclu',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    icon: <BlockRoundedIcon />,
    description: 'Taux d\'absence ≥ 50% — exclu des examens',
  },
};

// ─── Données mock ─────────────────────────────────────────────────────────────

const MOCK_COURSES: CourseSummary[] = [
  { id: 'course-001', code: 'INF301', title: 'Algorithmique avancée', major: 'Génie Informatique', year: 3, semester: 5, credits: 4, professorName: 'Pr. Chraibi', isActive: true },
  { id: 'course-002', code: 'INF302', title: 'Programmation Web', major: 'Génie Informatique', year: 3, semester: 5, credits: 3, professorName: 'Pr. Chraibi', isActive: true },
  { id: 'course-003', code: 'MKT201', title: 'Marketing Digital', major: 'Marketing', year: 2, semester: 3, credits: 3, professorName: 'Pr. Bennis', isActive: true },
];

const MOCK_REPORT: AttendanceReportEntry[] = [
  { studentId: 's1', firstName: 'Amine', lastName: 'Benali', major: 'Génie Informatique', courseId: 'course-001', courseTitle: 'Algorithmique avancée', totalSessions: 10, presentCount: 9, absentCount: 1, lateCount: 0, excusedCount: 0, absenceRate: 0.1, eligibility: 'ELIGIBLE' },
  { studentId: 's2', firstName: 'Sarah', lastName: 'Alaoui', major: 'Génie Informatique', courseId: 'course-001', courseTitle: 'Algorithmique avancée', totalSessions: 10, presentCount: 5, absentCount: 4, lateCount: 1, excusedCount: 0, absenceRate: 0.4, eligibility: 'RATTRAPAGE_ONLY' },
  { studentId: 's3', firstName: 'Youssef', lastName: 'Errami', major: 'Génie Informatique', courseId: 'course-001', courseTitle: 'Algorithmique avancée', totalSessions: 10, presentCount: 4, absentCount: 5, lateCount: 0, excusedCount: 1, absenceRate: 0.5, eligibility: 'EXCLUDED' },
  { studentId: 's4', firstName: 'Nadia', lastName: 'Chafik', major: 'Génie Informatique', courseId: 'course-001', courseTitle: 'Algorithmique avancée', totalSessions: 10, presentCount: 8, absentCount: 2, lateCount: 0, excusedCount: 0, absenceRate: 0.2, eligibility: 'ELIGIBLE' },
  { studentId: 's5', firstName: 'Omar', lastName: 'Tazi', major: 'Génie Informatique', courseId: 'course-001', courseTitle: 'Algorithmique avancée', totalSessions: 10, presentCount: 7, absentCount: 3, lateCount: 0, excusedCount: 0, absenceRate: 0.3, eligibility: 'RATTRAPAGE_ONLY' },
  { studentId: 's6', firstName: 'Fatima', lastName: 'Moussaoui', major: 'Génie Informatique', courseId: 'course-001', courseTitle: 'Algorithmique avancée', totalSessions: 10, presentCount: 10, absentCount: 0, lateCount: 0, excusedCount: 0, absenceRate: 0.0, eligibility: 'ELIGIBLE' },
  { studentId: 's7', firstName: 'Karim', lastName: 'Belkadi', major: 'Génie Informatique', courseId: 'course-001', courseTitle: 'Algorithmique avancée', totalSessions: 10, presentCount: 2, absentCount: 7, lateCount: 0, excusedCount: 1, absenceRate: 0.7, eligibility: 'EXCLUDED' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pct = (rate: number) => `${Math.round(rate * 100)}%`;

const EligibilityBadge: React.FC<{ eligibility: AttendanceEligibility }> = ({ eligibility }) => {
  const cfg = ELIGIBILITY_CONFIG[eligibility];
  return (
    <Tooltip title={cfg.description} placement="top">
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.5,
        px: 1.2, py: 0.4, borderRadius: '20px',
        bgcolor: cfg.bgColor, color: cfg.color,
        fontWeight: 700, fontSize: '0.78rem',
        border: `1px solid ${cfg.color}30`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', '& > svg': { fontSize: 14 } }}>
          {cfg.icon}
        </Box>
        {cfg.label}
      </Box>
    </Tooltip>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

const AdminAttendancePage: React.FC = () => {
  const theme = useTheme();

  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [report, setReport] = useState<AttendanceReportEntry[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEligibility, setFilterEligibility] = useState<AttendanceEligibility | ''>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Chargement des cours via adminService (stats → liste via admin/courses)
  useEffect(() => {
    const fetch = async () => {
      setLoadingCourses(true);
      try {
        // On essaie de récupérer la liste des cours via l'endpoint admin
        const { data } = await (await import('../../services/adminService' as any)).default?.getCourses?.() ?? { data: null };
        if (data && Array.isArray(data)) {
          setCourses(data);
          if (data.length > 0) setSelectedCourseId(String(data[0].id));
        } else throw new Error('fallback');
      } catch {
        setCourses(MOCK_COURSES);
        setSelectedCourseId('course-001');
      } finally {
        setLoadingCourses(false);
      }
    };
    fetch();
  }, []);

  // Chargement du rapport quand le cours change
  useEffect(() => {
    if (!selectedCourseId) return;
    const fetch = async () => {
      setLoadingReport(true);
      setErrorMsg(null);
      try {
        const data = await getCourseAttendanceReport(selectedCourseId);
        setReport(data);
      } catch {
        setReport(MOCK_REPORT);
      } finally {
        setLoadingReport(false);
      }
    };
    fetch();
  }, [selectedCourseId]);

  // Filtres
  const filtered = report.filter((r) => {
    const matchSearch = `${r.firstName} ${r.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchEligibility = filterEligibility ? r.eligibility === filterEligibility : true;
    return matchSearch && matchEligibility;
  });

  // Compteurs par éligibilité
  const eligibilityCounts = report.reduce(
    (acc, r) => { acc[r.eligibility]++; return acc; },
    { ELIGIBLE: 0, RATTRAPAGE_ONLY: 0, EXCLUDED: 0 } as Record<AttendanceEligibility, number>
  );

  const selectedCourse = courses.find((c) => String(c.id) === selectedCourseId);

  if (loadingCourses) return <LoadingSpinner fullPage message="Chargement…" />;

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{
        background: `linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)`,
        borderRadius: 4, p: { xs: 3, sm: 4 }, mb: 4, color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', bgcolor: alpha('#fff', 0.06) }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <AssignmentTurnedInRoundedIcon sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={700}>Rapport des Présences</Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            Suivez les absences et vérifiez l'éligibilité des étudiants aux examens
          </Typography>
        </Box>
      </Box>

      {errorMsg && <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>{errorMsg}</Alert>}

      {/* ── Sélecteur cours ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <UPFCard noHover>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              <MenuBookRoundedIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              Sélectionner un cours
            </Typography>
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
            {selectedCourse && (
              <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <UPFChip label={selectedCourse.major} size="small" />
                <UPFChip label={`${selectedCourse.year}ème année`} size="small" />
                <UPFChip label={`S${selectedCourse.semester}`} size="small" />
              </Box>
            )}
          </UPFCard>
        </Grid>

        {/* Statistiques d'éligibilité */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            {(Object.entries(ELIGIBILITY_CONFIG) as [AttendanceEligibility, typeof ELIGIBILITY_CONFIG[AttendanceEligibility]][]).map(([key, cfg]) => (
              <Grid size={{ xs: 4 }} key={key}>
                <UPFCard
                  sx={{
                    textAlign: 'center', cursor: 'pointer',
                    border: `2px solid ${filterEligibility === key ? cfg.color : 'transparent'}`,
                    '&:hover': { borderColor: cfg.color },
                  }}
                  onClick={() => setFilterEligibility(filterEligibility === key ? '' : key)}
                >
                  <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: cfg.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, mx: 'auto', mb: 1 }}>
                    {cfg.icon}
                  </Box>
                  <Typography variant="h4" fontWeight={700} sx={{ color: cfg.color }}>{eligibilityCounts[key]}</Typography>
                  <Typography variant="caption" color="text.secondary">{cfg.label}</Typography>
                </UPFCard>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* ── Filtres ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <UPFSearchBar placeholder="Rechercher un étudiant…" value={search} onChange={setSearch} fullWidth />
        </Box>
        {filterEligibility && (
          <UPFChip
            label={`Filtre : ${ELIGIBILITY_CONFIG[filterEligibility].label}`}
            onDelete={() => setFilterEligibility('')}
            sx={{ bgcolor: alpha(ELIGIBILITY_CONFIG[filterEligibility].color, 0.1), color: ELIGIBILITY_CONFIG[filterEligibility].color }}
          />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <PeopleRoundedIcon fontSize="small" />
          <Typography variant="body2">{filtered.length} étudiant{filtered.length > 1 ? 's' : ''}</Typography>
        </Box>
      </Box>

      {/* ── Tableau rapport ── */}
      <UPFCard noHover padding={0}>
        {loadingReport ? (
          <Box sx={{ p: 4, textAlign: 'center' }}><LoadingSpinner /></Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <AssignmentTurnedInRoundedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">Aucun résultat</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Étudiant</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Total séances</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Présent</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Absent</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Retard</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Taux absence</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Éligibilité</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((entry) => {
                  const absRate = entry.absenceRate;
                  const absColor = absRate >= 0.5 ? '#EF4444' : absRate >= 0.3 ? '#F59E0B' : '#10B981';
                  return (
                    <TableRow key={entry.studentId} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <UPFAvatar firstName={entry.firstName} lastName={entry.lastName} size="small" />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {entry.firstName} {entry.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{entry.major}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600}>{entry.totalSessions}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="#10B981" fontWeight={600}>{entry.presentCount}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="#EF4444" fontWeight={600}>{entry.absentCount}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="#F59E0B" fontWeight={600}>{entry.lateCount}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minWidth: 80 }}>
                          <Typography variant="body2" fontWeight={700} color={absColor}>
                            {pct(absRate)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(absRate * 100, 100)}
                            sx={{
                              width: '70px', height: 4, borderRadius: 2,
                              bgcolor: alpha(absColor, 0.15),
                              '& .MuiLinearProgress-bar': { bgcolor: absColor, borderRadius: 2 },
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <EligibilityBadge eligibility={entry.eligibility} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </UPFCard>

      {/* ── Légende ── */}
      <Box sx={{ mt: 3, p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}` }}>
        <Typography variant="subtitle2" fontWeight={600} mb={1.5}>📋 Règles d'éligibilité</Typography>
        <Grid container spacing={2}>
          {(Object.entries(ELIGIBILITY_CONFIG) as [AttendanceEligibility, typeof ELIGIBILITY_CONFIG[AttendanceEligibility]][]).map(([, cfg]) => (
            <Grid size={{ xs: 12, sm: 4 }} key={cfg.label}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: cfg.color }}>
                {cfg.icon}
                <Box>
                  <Typography variant="body2" fontWeight={600} color={cfg.color}>{cfg.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{cfg.description}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminAttendancePage;
