/**
 * StudentAttendancePage — Rapport personnel de présences (vue étudiant)
 *
 * L'étudiant peut voir :
 *   - Son taux d'absence par cours
 *   - Son statut d'éligibilité (ELIGIBLE / RATTRAPAGE_ONLY / EXCLUDED)
 *   - Un résumé global de sa situation
 */
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, useTheme, alpha, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Alert, Tooltip,
} from '@mui/material';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFChip from '../../components/ui/UPFChip';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import type { AttendanceReportEntry, AttendanceEligibility } from '../../types';
import { getMyAttendanceReport } from '../../services/attendanceService';

// ─── Config éligibilité ───────────────────────────────────────────────────────

const ELIGIBILITY_CONFIG: Record<AttendanceEligibility, {
  label: string; color: string; bgColor: string; icon: React.ReactNode;
  description: string; heroText: string;
}> = {
  ELIGIBLE: {
    label: 'Éligible à l\'examen',
    color: '#10B981',
    bgColor: '#D1FAE5',
    icon: <CheckCircleRoundedIcon />,
    description: 'Taux d\'absence inférieur à 30%',
    heroText: '🎉 Bonne assiduité !',
  },
  RATTRAPAGE_ONLY: {
    label: 'Rattrapage uniquement',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: <WarningRoundedIcon />,
    description: 'Taux d\'absence entre 30% et 50%',
    heroText: '⚠️ Attention — Rattrapage requis',
  },
  EXCLUDED: {
    label: 'Exclu des examens',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    icon: <BlockRoundedIcon />,
    description: 'Taux d\'absence supérieur ou égal à 50%',
    heroText: '🚫 Trop d\'absences — Consulter l\'administration',
  },
};

// ─── Données mock réalistes ───────────────────────────────────────────────────

const MOCK_REPORT: AttendanceReportEntry[] = [
  {
    studentId: 'me', firstName: 'Amine', lastName: 'Benali',
    major: 'Génie Informatique', courseId: 'c1', courseTitle: 'Algorithmique avancée',
    totalSessions: 12, presentCount: 11, absentCount: 1, lateCount: 0, excusedCount: 0,
    absenceRate: 0.083, eligibility: 'ELIGIBLE',
  },
  {
    studentId: 'me', firstName: 'Amine', lastName: 'Benali',
    major: 'Génie Informatique', courseId: 'c2', courseTitle: 'Programmation Web',
    totalSessions: 10, presentCount: 6, absentCount: 3, lateCount: 1, excusedCount: 0,
    absenceRate: 0.3, eligibility: 'RATTRAPAGE_ONLY',
  },
  {
    studentId: 'me', firstName: 'Amine', lastName: 'Benali',
    major: 'Génie Informatique', courseId: 'c3', courseTitle: 'Base de données avancées',
    totalSessions: 8, presentCount: 8, absentCount: 0, lateCount: 0, excusedCount: 0,
    absenceRate: 0.0, eligibility: 'ELIGIBLE',
  },
  {
    studentId: 'me', firstName: 'Amine', lastName: 'Benali',
    major: 'Génie Informatique', courseId: 'c4', courseTitle: 'Réseaux informatiques',
    totalSessions: 10, presentCount: 3, absentCount: 6, lateCount: 0, excusedCount: 1,
    absenceRate: 0.6, eligibility: 'EXCLUDED',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pct = (rate: number) => `${Math.round(rate * 100)}%`;

const EligibilityBadge: React.FC<{ eligibility: AttendanceEligibility; size?: 'small' | 'normal' }> = ({ eligibility, size = 'normal' }) => {
  const cfg = ELIGIBILITY_CONFIG[eligibility];
  return (
    <Tooltip title={cfg.description} placement="top">
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.5,
        px: size === 'small' ? 1 : 1.5,
        py: size === 'small' ? 0.3 : 0.5,
        borderRadius: '20px',
        bgcolor: cfg.bgColor, color: cfg.color,
        fontWeight: 700,
        fontSize: size === 'small' ? '0.75rem' : '0.82rem',
        border: `1px solid ${cfg.color}30`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', '& > svg': { fontSize: size === 'small' ? 12 : 14 } }}>
          {cfg.icon}
        </Box>
        {cfg.label}
      </Box>
    </Tooltip>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

const StudentAttendancePage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();

  const [report, setReport] = useState<AttendanceReportEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getMyAttendanceReport();
        setReport(data);
      } catch {
        setReport(MOCK_REPORT);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Calculs globaux ──
  const totalCourses = report.length;
  const globalPresent = report.reduce((s, r) => s + r.presentCount, 0);
  const globalTotal = report.reduce((s, r) => s + r.totalSessions, 0);
  const globalAbsenceRate = globalTotal > 0 ? 1 - globalPresent / globalTotal : 0;

  const eligibilityCounts = report.reduce(
    (acc, r) => { acc[r.eligibility]++; return acc; },
    { ELIGIBLE: 0, RATTRAPAGE_ONLY: 0, EXCLUDED: 0 } as Record<AttendanceEligibility, number>
  );

  // Éligibilité globale = la pire trouvée
  const globalEligibility: AttendanceEligibility =
    eligibilityCounts.EXCLUDED > 0 ? 'EXCLUDED' :
      eligibilityCounts.RATTRAPAGE_ONLY > 0 ? 'RATTRAPAGE_ONLY' : 'ELIGIBLE';

  const globalCfg = ELIGIBILITY_CONFIG[globalEligibility];

  if (loading) return <LoadingSpinner fullPage message="Chargement de vos présences…" />;

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
            <AssignmentTurnedInRoundedIcon sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={700}>Mes Présences</Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            Bonjour {user?.firstName} — voici votre bilan d'assiduité
          </Typography>
        </Box>
      </Box>

      {errorMsg && <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>{errorMsg}</Alert>}

      {/* ── Résumé global ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Carte statut global */}
        <Grid size={{ xs: 12, md: 4 }}>
          <UPFCard noHover sx={{ border: `2px solid ${globalCfg.color}30`, textAlign: 'center', p: 3 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: globalCfg.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: globalCfg.color, mx: 'auto', mb: 2, '& > svg': { fontSize: 32 } }}>
              {globalCfg.icon}
            </Box>
            <Typography variant="h6" fontWeight={700} color={globalCfg.color} mb={0.5}>
              {globalCfg.heroText}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {globalCfg.description}
            </Typography>
            <EligibilityBadge eligibility={globalEligibility} />
          </UPFCard>
        </Grid>

        {/* Stats rapides */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={2}>
            {[
              { label: 'Cours suivis', value: totalCourses, color: '#3B82F6', icon: <MenuBookRoundedIcon /> },
              { label: 'Séances présent', value: globalPresent, color: '#10B981', icon: <CheckCircleRoundedIcon /> },
              { label: 'Taux présence', value: `${Math.round((1 - globalAbsenceRate) * 100)}%`, color: '#8B5CF6', icon: <TrendingUpRoundedIcon /> },
              { label: 'Cours éligibles', value: eligibilityCounts.ELIGIBLE, color: '#10B981', icon: <CheckCircleRoundedIcon /> },
              { label: 'Rattrapages', value: eligibilityCounts.RATTRAPAGE_ONLY, color: '#F59E0B', icon: <WarningRoundedIcon /> },
              { label: 'Exclusions', value: eligibilityCounts.EXCLUDED, color: '#EF4444', icon: <BlockRoundedIcon /> },
            ].map((stat) => (
              <Grid size={{ xs: 6, sm: 4 }} key={stat.label}>
                <UPFCard sx={{ textAlign: 'center' }}>
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

      {/* ── Tableau détaillé par cours ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <MenuBookRoundedIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={600}>Détail par cours</Typography>
      </Box>

      {report.length === 0 ? (
        <UPFCard>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <AssignmentTurnedInRoundedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">Aucune donnée de présence disponible</Typography>
            <Typography variant="body2" color="text.disabled">Les données apparaîtront une fois que vos cours auront démarré</Typography>
          </Box>
        </UPFCard>
      ) : (
        <UPFCard noHover padding={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Cours</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Séances</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Présences</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Absences</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Retards</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Taux absence</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Éligibilité</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.map((entry) => {
                  const absColor =
                    entry.absenceRate >= 0.5 ? '#EF4444' :
                      entry.absenceRate >= 0.3 ? '#F59E0B' : '#10B981';
                  return (
                    <TableRow key={entry.courseId} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MenuBookRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          </Box>
                          <Typography variant="body2" fontWeight={600}>{entry.courseTitle}</Typography>
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
                            {pct(entry.absenceRate)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(entry.absenceRate * 100, 100)}
                            sx={{
                              width: '70px', height: 5, borderRadius: 2,
                              bgcolor: alpha(absColor, 0.15),
                              '& .MuiLinearProgress-bar': { bgcolor: absColor, borderRadius: 2 },
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <EligibilityBadge eligibility={entry.eligibility} size="small" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </UPFCard>
      )}

      {/* ── Info légende ── */}
      <Box sx={{ mt: 3, p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.15)}` }}>
        <Typography variant="subtitle2" fontWeight={600} mb={1}>ℹ️ Comment fonctionne l'éligibilité ?</Typography>
        <Grid container spacing={1.5}>
          {[
            { label: '✅ Éligible', desc: 'Absence < 30% — accès à l\'examen normal', color: '#10B981' },
            { label: '⚠️ Rattrapage', desc: 'Absence 30–50% — accès au rattrapage uniquement', color: '#F59E0B' },
            { label: '🚫 Exclu', desc: 'Absence ≥ 50% — contactez l\'administration', color: '#EF4444' },
          ].map((item) => (
            <Grid size={{ xs: 12, sm: 4 }} key={item.label}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Typography variant="body2" fontWeight={700} color={item.color}>{item.label}</Typography>
                <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default StudentAttendancePage;
