/**
 * ExamListPage — Liste des épreuves avec filtres
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, MenuItem, TextField, Pagination,
  Skeleton,
} from '@mui/material';

import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import UPFChip from '../../components/ui/UPFChip';
import UPFButton from '../../components/ui/UPFButton';
import UPFAvatar from '../../components/ui/UPFAvatar';
import EmptyState from '../../components/common/EmptyState';
import type { Exam, ExamFilters, ExamType } from '../../types';
import { getExams } from '../../services/examService';

const EXAM_TYPES: { value: ExamType | ''; label: string }[] = [
  { value: '', label: 'Tous les types' },
  { value: 'PARTIEL', label: 'Partiel' },
  { value: 'FINAL', label: 'Final' },
  { value: 'RATTRAPAGE', label: 'Rattrapage' },
  { value: 'CC', label: 'Contrôle continu' },
  { value: 'TP', label: 'TP' },
];

const typeColorMap: Record<string, 'primary' | 'secondary' | 'success' | 'error' | 'info'> = {
  PARTIEL: 'info',
  FINAL: 'error',
  RATTRAPAGE: 'secondary',
  CC: 'success',
  TP: 'primary',
  AUTRE: 'primary',
};

const ExamListPage: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const filters: ExamFilters = {
          page: page - 1, size: 12,
          subject: search || undefined,
          examType: (type as ExamType) || undefined,
        };
        const result = await getExams(filters);
        setExams(result.content);
        setTotalPages(result.totalPages);
      } catch {
        setExams(MOCK_EXAMS);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [page, search, type]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} mb={0.5}>📝 Épreuves</Typography>
          <Typography variant="body1" color="text.secondary">
            Partagez et retrouvez les épreuves de vos matières
          </Typography>
        </Box>
        <UPFButton variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/student/exams/upload')}>
          Déposer une épreuve
        </UPFButton>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        <UPFSearchBar placeholder="Rechercher une épreuve…" value={search} onChange={setSearch} fullWidth />
        <TextField select size="small" label="Type" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 160 }}>
          {EXAM_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
        </TextField>
      </Box>

      {loading ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
              <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : exams.length === 0 ? (
        <EmptyState title="Aucune épreuve trouvée" description="Soyez le premier à partager une épreuve !" actionLabel="Déposer une épreuve" onAction={() => navigate('/student/exams/upload')} />
      ) : (
        <>
          <Grid container spacing={2.5}>
            {exams.map((exam) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={exam.id}>
                <UPFCard sx={{ cursor: 'pointer', height: '100%' }} onClick={() => navigate(`/student/exams/${exam.id}`)}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <UPFChip label={exam.type} size="small" colorVariant={typeColorMap[exam.type] || 'primary'} />
                    <UPFChip label={exam.anneeAcademique} size="small" colorVariant="secondary" />
                  </Box>
                  <Typography variant="h6" fontWeight={600} mb={0.5} noWrap>{exam.title}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>{exam.matiere}</Typography>
                  {exam.description && (
                    <Typography variant="body2" color="text.secondary" mb={2}
                      sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {exam.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <UPFAvatar firstName={exam.uploadedBy.firstName} lastName={exam.uploadedBy.lastName} size="small" />
                      <Typography variant="caption" color="text.secondary">
                        {exam.uploadedBy.firstName} {exam.uploadedBy.lastName?.[0]}.
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <ThumbUpAltRoundedIcon sx={{ fontSize: 14, color: 'success.main' }} />
                        <Typography variant="caption">{exam.upvotes}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <ThumbDownAltRoundedIcon sx={{ fontSize: 14, color: 'error.main' }} />
                        <Typography variant="caption">{exam.downvotes}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <DownloadRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption">{exam.downloadCount}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </UPFCard>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" shape="rounded" />
          </Box>
        </>
      )}
    </Box>
  );
};

const MOCK_EXAMS: Exam[] = [
  { id: 1, title: 'Examen Final Algorithmique', matiere: 'Algorithmique', anneeAcademique: '2024-2025', type: 'FINAL', description: 'Examen final couvrant les chapitres 1 à 8.', fileUrl: '#', fileName: 'algo_final.pdf', fileSizeBytes: 3200000, downloadCount: 87, upvotes: 24, downvotes: 2, uploadedBy: { id: 1, firstName: 'Amina', lastName: 'Benali' }, createdAt: '2025-06-15' },
  { id: 2, title: 'Partiel BDD Avancées', matiere: 'Base de Données', anneeAcademique: '2024-2025', type: 'PARTIEL', description: 'Partiel S1 — SQL avancé et normalisation.', fileUrl: '#', fileName: 'bdd_partiel.pdf', fileSizeBytes: 1800000, downloadCount: 56, upvotes: 15, downvotes: 1, uploadedBy: { id: 2, firstName: 'Youssef', lastName: 'Karimi' }, createdAt: '2025-01-20' },
  { id: 3, title: 'CC1 Marketing Digital', matiere: 'Marketing Digital', anneeAcademique: '2024-2025', type: 'CC', fileUrl: '#', fileName: 'mkt_cc1.pdf', fileSizeBytes: 950000, downloadCount: 32, upvotes: 8, downvotes: 0, uploadedBy: { id: 3, firstName: 'Sara', lastName: 'Moussaoui' }, createdAt: '2024-11-10' },
  { id: 4, title: 'TP Réseau — Config Routeurs', matiere: 'Réseaux Informatiques', anneeAcademique: '2024-2025', type: 'TP', description: 'TP noté sur la configuration des routeurs Cisco.', fileUrl: '#', fileName: 'reseau_tp.pdf', fileSizeBytes: 2100000, downloadCount: 41, upvotes: 12, downvotes: 3, uploadedBy: { id: 1, firstName: 'Amina', lastName: 'Benali' }, createdAt: '2024-12-05' },
  { id: 5, title: 'Rattrapage Maths Discrètes', matiere: 'Mathématiques Discrètes', anneeAcademique: '2023-2024', type: 'RATTRAPAGE', fileUrl: '#', fileName: 'maths_ratt.pdf', fileSizeBytes: 1500000, downloadCount: 28, upvotes: 6, downvotes: 1, uploadedBy: { id: 4, firstName: 'Omar', lastName: 'Tazi' }, createdAt: '2024-07-20' },
  { id: 6, title: 'Final Droit des Affaires', matiere: 'Droit des Affaires', anneeAcademique: '2024-2025', type: 'FINAL', description: 'Cas pratique + questions de cours.', fileUrl: '#', fileName: 'droit_final.pdf', fileSizeBytes: 2800000, downloadCount: 45, upvotes: 18, downvotes: 0, uploadedBy: { id: 5, firstName: 'Leila', lastName: 'Fassi' }, createdAt: '2025-06-20' },
];

export default ExamListPage;
