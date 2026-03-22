/**
 * ExamDetailPage — Détail d'une épreuve
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, IconButton, Breadcrumbs, Link, Divider, useTheme, alpha,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFChip from '../../components/ui/UPFChip';
import UPFButton from '../../components/ui/UPFButton';
import UPFAvatar from '../../components/ui/UPFAvatar';
import UPFModal from '../../components/ui/UPFModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Exam, ReportReason } from '../../types';
import { getExamById, downloadExam, voteExam, reportExam } from '../../services/examService';

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'INAPPROPRIATE', label: 'Contenu inapproprié' },
  { value: 'ERROR', label: 'Erreur dans le document' },
  { value: 'DUPLICATE', label: 'Doublon' },
  { value: 'PLAGIARISM', label: 'Plagiat' },
  { value: 'OTHER', label: 'Autre' },
];

const ExamDetailPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getExamById(Number(id));
        setExam(data);
      } catch {
        setExam({
          id: Number(id), title: 'Examen Final Algorithmique', matiere: 'Algorithmique',
          anneeAcademique: '2024-2025', type: 'FINAL',
          description: 'Examen final couvrant les chapitres 1 à 8. Durée 3h. Documents autorisés : une feuille A4 recto-verso.',
          fileUrl: '#', fileName: 'algo_final_2025.pdf', fileSizeBytes: 3200000,
          downloadCount: 87, upvotes: 24, downvotes: 2,
          uploadedBy: { id: 1, firstName: 'Amina', lastName: 'Benali', avatarUrl: undefined },
          createdAt: '2025-06-15',
        });
      } finally { setLoading(false); }
    };
    fetchExam();
  }, [id]);

  const handleDownload = async () => {
    if (!exam) return;
    try {
      const blob = await downloadExam(exam.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = exam.fileName; a.click();
      window.URL.revokeObjectURL(url);
    } catch { /* fallback */ }
  };

  const handleVote = async (type: 'UP' | 'DOWN') => {
    if (!exam) return;
    try { await voteExam(exam.id, type); } catch { /* fallback */ }
  };

  const handleReport = async (reason: ReportReason) => {
    if (!exam) return;
    try {
      await reportExam(exam.id, reason);
      setReportOpen(false);
    } catch { setReportOpen(false); }
  };

  if (loading) return <LoadingSpinner fullPage message="Chargement de l'épreuve…" />;
  if (!exam) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/exams')}><ArrowBackRoundedIcon /></IconButton>
        <Breadcrumbs>
          <Link component="button" variant="body2" onClick={() => navigate('/exams')} underline="hover" color="text.secondary">Épreuves</Link>
          <Typography variant="body2" color="text.primary" fontWeight={500}>{exam.title}</Typography>
        </Breadcrumbs>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <UPFCard noHover>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <UPFChip label={exam.type} colorVariant="error" />
              <UPFChip label={exam.matiere} colorVariant="primary" />
              <UPFChip label={exam.anneeAcademique} colorVariant="secondary" />
            </Box>
            <Typography variant="h4" fontWeight={700} mb={2}>{exam.title}</Typography>
            {exam.description && (
              <Typography variant="body1" color="text.secondary" lineHeight={1.8} mb={3}>{exam.description}</Typography>
            )}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <UPFButton variant="contained" startIcon={<DownloadRoundedIcon />} onClick={handleDownload}>
                Télécharger ({(exam.fileSizeBytes / 1024 / 1024).toFixed(1)} Mo)
              </UPFButton>
              <UPFButton variant="outlined" startIcon={<ThumbUpAltRoundedIcon />} onClick={() => handleVote('UP')} color="success">
                {exam.upvotes}
              </UPFButton>
              <UPFButton variant="outlined" startIcon={<ThumbDownAltRoundedIcon />} onClick={() => handleVote('DOWN')} color="error">
                {exam.downvotes}
              </UPFButton>
              <UPFButton variant="text" startIcon={<FlagRoundedIcon />} onClick={() => setReportOpen(true)} color="warning">
                Signaler
              </UPFButton>
            </Box>
          </UPFCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <UPFCard noHover sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Informations</Typography>
            {[
              { label: 'Fichier', value: exam.fileName },
              { label: 'Taille', value: `${(exam.fileSizeBytes / 1024 / 1024).toFixed(1)} Mo` },
              { label: 'Téléchargements', value: `${exam.downloadCount}` },
              { label: 'Date de dépôt', value: new Date(exam.createdAt).toLocaleDateString('fr-FR') },
            ].map((info) => (
              <Box key={info.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" color="text.secondary">{info.label}</Typography>
                <Typography variant="body2" fontWeight={500}>{info.value}</Typography>
              </Box>
            ))}
          </UPFCard>

          <UPFCard noHover>
            <Typography variant="h6" fontWeight={600} mb={2}>Déposé par</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <UPFAvatar firstName={exam.uploadedBy.firstName} lastName={exam.uploadedBy.lastName} />
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {exam.uploadedBy.firstName} {exam.uploadedBy.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(exam.createdAt).toLocaleDateString('fr-FR')}
                </Typography>
              </Box>
            </Box>
          </UPFCard>
        </Grid>
      </Grid>

      {/* Modale de signalement */}
      <UPFModal title="Signaler cette épreuve" open={reportOpen} onClose={() => setReportOpen(false)}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Sélectionnez la raison du signalement :
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {REPORT_REASONS.map((r) => (
            <UPFButton key={r.value} variant="outlined" fullWidth onClick={() => handleReport(r.value)}
              sx={{ justifyContent: 'flex-start', textAlign: 'left' }}>
              {r.label}
            </UPFButton>
          ))}
        </Box>
      </UPFModal>
    </Box>
  );
};

export default ExamDetailPage;
