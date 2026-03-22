/**
 * ExamUploadPage — Dépôt d'une épreuve
 *
 * Formulaire avec zone de drag-and-drop pour le fichier (< 20 Mo).
 */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, MenuItem, Alert, useTheme, alpha,
} from '@mui/material';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import type { ExamType } from '../../types';
import { uploadExam } from '../../services/examService';

const EXAM_TYPES: { value: ExamType; label: string }[] = [
  { value: 'PARTIEL', label: 'Partiel' },
  { value: 'FINAL', label: 'Final' },
  { value: 'RATTRAPAGE', label: 'Rattrapage' },
  { value: 'CC', label: 'Contrôle continu' },
  { value: 'TP', label: 'TP' },
  { value: 'AUTRE', label: 'Autre' },
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 Mo

const ExamUploadPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    matiere: '',
    anneeAcademique: '',
    type: 'PARTIEL' as ExamType,
    description: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFile = (f: File) => {
    if (f.size > MAX_FILE_SIZE) {
      setError('Le fichier ne doit pas dépasser 20 Mo.');
      return;
    }
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(f.type)) {
      setError('Formats acceptés : PDF, DOC, DOCX, JPG, PNG.');
      return;
    }
    setFile(f);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.title || !formData.matiere || !formData.anneeAcademique || !file) {
      setError('Veuillez remplir tous les champs et sélectionner un fichier.');
      return;
    }
    setLoading(true);
    try {
      await uploadExam({ ...formData, file });
      setSuccess(true);
      setTimeout(() => navigate('/exams'), 2000);
    } catch {
      setError('Erreur lors du dépôt. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} mb={0.5}>📤 Déposer une épreuve</Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Partagez une épreuve avec la communauté UPF
      </Typography>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Épreuve déposée avec succès ! Redirection…</Alert>}

      <UPFCard noHover>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField id="upload-title" label="Titre de l'épreuve" value={formData.title} onChange={handleChange('title')} fullWidth required sx={{ mb: 2.5 }} placeholder="Ex: Examen Final Algorithmique 2025" />
          <TextField id="upload-matiere" label="Matière" value={formData.matiere} onChange={handleChange('matiere')} fullWidth required sx={{ mb: 2.5 }} placeholder="Ex: Algorithmique et Structures de Données" />
          <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
            <TextField id="upload-annee" label="Année académique" value={formData.anneeAcademique} onChange={handleChange('anneeAcademique')} fullWidth required placeholder="Ex: 2024-2025" />
            <TextField id="upload-type" label="Type" value={formData.type} onChange={handleChange('type')} fullWidth required select>
              {EXAM_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </TextField>
          </Box>
          <TextField id="upload-description" label="Description (optionnel)" value={formData.description} onChange={handleChange('description')} fullWidth multiline rows={3} sx={{ mb: 3 }} placeholder="Informations supplémentaires sur l'épreuve…" />

          {/* Zone de drag-and-drop */}
          <Box
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: `2px dashed ${dragOver ? theme.palette.primary.main : theme.palette.divider}`,
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: dragOver ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
              transition: 'all 0.2s',
              mb: 3,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              },
            }}
          >
            <input ref={fileInputRef} type="file" hidden accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            {file ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <InsertDriveFileRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight={600}>{file.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{(file.size / 1024 / 1024).toFixed(2)} Mo</Typography>
                </Box>
                <UPFButton variant="text" color="error" size="small" startIcon={<DeleteRoundedIcon />}
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                  Supprimer
                </UPFButton>
              </Box>
            ) : (
              <>
                <CloudUploadRoundedIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                <Typography variant="body1" fontWeight={500} mb={0.5}>
                  Glissez-déposez votre fichier ici
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ou cliquez pour sélectionner — PDF, DOC, DOCX, JPG, PNG (max 20 Mo)
                </Typography>
              </>
            )}
          </Box>

          <UPFButton type="submit" variant="contained" fullWidth size="large" loading={loading} sx={{ py: 1.5 }}>
            Déposer l'épreuve
          </UPFButton>
        </Box>
      </UPFCard>
    </Box>
  );
};

export default ExamUploadPage;
