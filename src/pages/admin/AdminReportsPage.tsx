/**
 * AdminReportsPage — Traitement des épreuves signalées
 */
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, useTheme, alpha, Chip,
} from '@mui/material';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFModal from '../../components/ui/UPFModal';
import type { ExamReport, ReportStatus } from '../../types';
import { getReports, updateReportStatus, toggleExamVisibility } from '../../services/adminService';

const MOCK_REPORTS: ExamReport[] = [
  { id: 1, examId: 5, examTitle: 'Partiel Algo 2024 — Corrigé', userId: 3, reporterName: 'Youssef K.', reason: 'ERROR', status: 'PENDING', description: 'Le corrigé contient des erreurs à la question 3.', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 2, examId: 8, examTitle: 'TP Base de données — Série 2', userId: 6, reporterName: 'Kenza M.', reason: 'DUPLICATE', status: 'PENDING', description: 'Cette épreuve existe déjà (doublon).', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 3, examId: 12, examTitle: 'Final Réseaux 2023', userId: 2, reporterName: 'Sarah A.', reason: 'PLAGIARISM', status: 'REVIEWED', description: 'Contenu copié sans autorisation.', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 4, examId: 3, examTitle: 'CC Maths Discrètes', userId: 5, reporterName: 'Omar F.', reason: 'INAPPROPRIATE', status: 'ACTIONED', description: 'Le fichier ne correspond pas à une épreuve.', createdAt: new Date(Date.now() - 604800000).toISOString() },
  { id: 5, examId: 15, examTitle: 'Rattrapage Java S3', userId: 4, reporterName: 'Lina T.', reason: 'OTHER', status: 'DISMISSED', description: 'Mauvaise matière sélectionnée.', createdAt: new Date(Date.now() - 864000000).toISOString() },
];

const statusColors: Record<ReportStatus, 'warning' | 'info' | 'error' | 'default'> = {
  PENDING: 'warning',
  REVIEWED: 'info',
  ACTIONED: 'error',
  DISMISSED: 'default',
};

const statusLabels: Record<ReportStatus, string> = {
  PENDING: 'En attente',
  REVIEWED: 'Examiné',
  ACTIONED: 'Action prise',
  DISMISSED: 'Classé',
};

const reasonLabels: Record<string, string> = {
  INAPPROPRIATE: 'Inapproprié',
  ERROR: 'Erreur',
  DUPLICATE: 'Doublon',
  PLAGIARISM: 'Plagiat',
  OTHER: 'Autre',
};

const AdminReportsPage: React.FC = () => {
  const theme = useTheme();
  const [reports, setReports] = useState<ExamReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [actionModal, setActionModal] = useState<{ open: boolean; report: ExamReport | null; action: 'hide' | 'dismiss' }>({ open: false, report: null, action: 'hide' });

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await getReports(statusFilter !== 'ALL' ? statusFilter : undefined);
        setReports(data);
      } catch {
        setReports(MOCK_REPORTS);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [statusFilter]);

  const filtered = statusFilter === 'ALL' ? reports : reports.filter((r) => r.status === statusFilter);

  const handleAction = async () => {
    if (!actionModal.report) return;
    const report = actionModal.report;
    try {
      if (actionModal.action === 'hide') {
        await toggleExamVisibility(report.examId, true);
        await updateReportStatus(report.id, 'ACTIONED');
      } else {
        await updateReportStatus(report.id, 'DISMISSED');
      }
    } catch { /* mock */ }

    const newStatus: ReportStatus = actionModal.action === 'hide' ? 'ACTIONED' : 'DISMISSED';
    setReports((prev) => prev.map((r) => r.id === report.id ? { ...r, status: newStatus } : r));
    setActionModal({ open: false, report: null, action: 'hide' });
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <FlagRoundedIcon sx={{ fontSize: 32, color: 'error.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={700}>Signalements</Typography>
          <Typography variant="body2" color="text.secondary">
            {reports.filter((r) => r.status === 'PENDING').length} signalement{reports.filter((r) => r.status === 'PENDING').length > 1 ? 's' : ''} en attente
          </Typography>
        </Box>
      </Box>

      {/* Filtre */}
      <UPFCard noHover sx={{ mb: 3 }}>
        <TextField select size="small" label="Statut" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'ALL')} sx={{ minWidth: 200 }}>
          <MenuItem value="ALL">Tous les statuts</MenuItem>
          <MenuItem value="PENDING">En attente</MenuItem>
          <MenuItem value="REVIEWED">Examiné</MenuItem>
          <MenuItem value="ACTIONED">Action prise</MenuItem>
          <MenuItem value="DISMISSED">Classé</MenuItem>
        </TextField>
      </UPFCard>

      {/* Table */}
      <UPFCard noHover padding={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <TableCell sx={{ fontWeight: 600 }}>Épreuve</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Signalé par</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Raison</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} sx={{ p: 3 }}>Chargement…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} sx={{ p: 4, textAlign: 'center' }}>Aucun signalement</TableCell></TableRow>
              ) : filtered.map((r) => (
                <TableRow key={r.id} hover sx={{ bgcolor: r.status === 'PENDING' ? alpha(theme.palette.warning.main, 0.03) : 'transparent' }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{r.examTitle}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{r.reporterName}</Typography></TableCell>
                  <TableCell>
                    <Chip label={reasonLabels[r.reason] || r.reason} size="small" variant="outlined" color="warning" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.description || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{formatDate(r.createdAt)}</Typography></TableCell>
                  <TableCell>
                    <Chip label={statusLabels[r.status]} size="small" color={statusColors[r.status]} variant="outlined" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell align="right">
                    {r.status === 'PENDING' && (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <UPFButton size="small" variant="contained" color="error"
                          startIcon={<VisibilityOffRoundedIcon />}
                          onClick={() => setActionModal({ open: true, report: r, action: 'hide' })}>
                          Masquer
                        </UPFButton>
                        <UPFButton size="small" variant="outlined"
                          startIcon={<CancelRoundedIcon />}
                          onClick={() => setActionModal({ open: true, report: r, action: 'dismiss' })}>
                          Classer
                        </UPFButton>
                      </Box>
                    )}
                    {r.status === 'REVIEWED' && (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <UPFButton size="small" variant="contained" color="error"
                          startIcon={<VisibilityOffRoundedIcon />}
                          onClick={() => setActionModal({ open: true, report: r, action: 'hide' })}>
                          Masquer
                        </UPFButton>
                      </Box>
                    )}
                    {(r.status === 'ACTIONED' || r.status === 'DISMISSED') && (
                      <Typography variant="caption" color="text.secondary">Traité</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </UPFCard>

      {/* Action Modal */}
      <UPFModal
        open={actionModal.open}
        onClose={() => setActionModal({ open: false, report: null, action: 'hide' })}
        title={actionModal.action === 'hide' ? 'Masquer l\'épreuve' : 'Classer le signalement'}
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setActionModal({ open: false, report: null, action: 'hide' })}>Annuler</UPFButton>
            <UPFButton variant="contained" color={actionModal.action === 'hide' ? 'error' : 'primary'} onClick={handleAction}>
              Confirmer
            </UPFButton>
          </>
        }
      >
        {actionModal.action === 'hide' ? (
          <>
            <Typography>
              Voulez-vous masquer l'épreuve <strong>{actionModal.report?.examTitle}</strong> ?
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              L'épreuve ne sera plus visible par les étudiants. Le signalement sera marqué comme traité.
            </Typography>
          </>
        ) : (
          <>
            <Typography>
              Voulez-vous classer ce signalement sans action ?
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              L'épreuve restera visible. Le signalement sera marqué comme classé.
            </Typography>
          </>
        )}
      </UPFModal>
    </Box>
  );
};

export default AdminReportsPage;
