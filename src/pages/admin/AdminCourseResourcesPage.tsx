/**
 * AdminCourseResourcesPage — Gestion des ressources d'un cours
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, IconButton, useTheme, alpha, Chip, Breadcrumbs, Link,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFModal from '../../components/ui/UPFModal';
import type { CourseResource } from '../../types';
import { getCourseResources } from '../../services/courseService';
import { uploadCourseResource, deleteCourseResource } from '../../services/adminService';

const RESOURCE_TYPES = ['PDF', 'DOC', 'ZIP', 'LINK', 'VIDEO'];

const AdminCourseResourcesPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = id ? Number(id) : 0;

  const [resources, setResources] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('PDF');
  const [uploading, setUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; resource: CourseResource | null }>({ open: false, resource: null });

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const data = await getCourseResources(courseId);
        setResources(data);
      } catch {
        setResources([
          { id: 1, courseId, title: 'Cours magistral — Chapitre 1', type: 'PDF', url: '#', sizeBytes: 2048000, downloadCount: 34 },
          { id: 2, courseId, title: 'TD Série 1 — Exercices', type: 'PDF', url: '#', sizeBytes: 512000, downloadCount: 56 },
          { id: 3, courseId, title: 'TP 1 — Enoncé + Annexes', type: 'ZIP', url: '#', sizeBytes: 4096000, downloadCount: 22 },
          { id: 4, courseId, title: 'Vidéo explicative — Tri rapide', type: 'VIDEO', url: '#', sizeBytes: 0, downloadCount: 15 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [courseId]);

  const handleUpload = async () => {
    if (!file || !title.trim()) return;
    setUploading(true);
    try {
      const newResource = await uploadCourseResource(courseId, file, title, type);
      setResources((prev) => [...prev, newResource]);
    } catch {
      setResources((prev) => [...prev, { id: Date.now(), courseId, title, type: type as CourseResource['type'], url: '#', sizeBytes: file.size, downloadCount: 0 }]);
    } finally {
      setUploading(false);
      setUploadOpen(false);
      setFile(null);
      setTitle('');
      setType('PDF');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.resource) return;
    try { await deleteCourseResource(courseId, deleteModal.resource.id); } catch { /* mock */ }
    setResources((prev) => prev.filter((r) => r.id !== deleteModal.resource!.id));
    setDeleteModal({ open: false, resource: null });
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const typeColors: Record<string, string> = { PDF: '#EF4444', DOC: '#3B82F6', ZIP: '#F59E0B', LINK: '#10B981', VIDEO: '#8B5CF6', DOCUMENT: '#3B82F6' };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/courses')}><ArrowBackRoundedIcon /></IconButton>
        <Breadcrumbs>
          <Link component="button" variant="body2" onClick={() => navigate('/admin/courses')} underline="hover" color="text.secondary">Cours</Link>
          <Typography variant="body2" color="text.primary" fontWeight={500}>Ressources</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <InsertDriveFileRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>Ressources du cours</Typography>
            <Typography variant="body2" color="text.secondary">{resources.length} ressource{resources.length > 1 ? 's' : ''}</Typography>
          </Box>
        </Box>
        <UPFButton variant="contained" startIcon={<CloudUploadRoundedIcon />} onClick={() => setUploadOpen(true)}>
          Ajouter une ressource
        </UPFButton>
      </Box>

      <UPFCard noHover padding={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <TableCell sx={{ fontWeight: 600 }}>Titre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Taille</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Téléchargements</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} sx={{ p: 3 }}>Chargement…</TableCell></TableRow>
              ) : resources.length === 0 ? (
                <TableRow><TableCell colSpan={5} sx={{ p: 4, textAlign: 'center' }}>Aucune ressource pour ce cours</TableCell></TableRow>
              ) : resources.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InsertDriveFileRoundedIcon sx={{ color: typeColors[r.type] || '#888', fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={500}>{r.title}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={r.type} size="small" sx={{ bgcolor: alpha(typeColors[r.type] || '#888', 0.1), color: typeColors[r.type] || '#888', fontWeight: 600 }} />
                  </TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{formatSize(r.sizeBytes)}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <DownloadRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">{r.downloadCount}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <UPFButton size="small" variant="outlined" color="error" startIcon={<DeleteRoundedIcon />}
                      onClick={() => setDeleteModal({ open: true, resource: r })}>
                      Supprimer
                    </UPFButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </UPFCard>

      {/* Upload Modal */}
      <UPFModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Ajouter une ressource"
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setUploadOpen(false)}>Annuler</UPFButton>
            <UPFButton variant="contained" onClick={handleUpload} loading={uploading} disabled={!file || !title.trim()}>
              Uploader
            </UPFButton>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Titre de la ressource" value={title} onChange={(e) => setTitle(e.target.value)} size="small" required />
          <TextField label="Type" value={type} onChange={(e) => setType(e.target.value)} select size="small">
            {RESOURCE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <Box
            sx={{
              border: `2px dashed ${theme.palette.divider}`, borderRadius: 2, p: 3,
              textAlign: 'center', cursor: 'pointer',
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              '&:hover': { borderColor: theme.palette.primary.main },
            }}
            onClick={() => document.getElementById('resource-file-input')?.click()}
          >
            <CloudUploadRoundedIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {file ? file.name : 'Cliquez pour sélectionner un fichier'}
            </Typography>
            <input id="resource-file-input" type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </Box>
        </Box>
      </UPFModal>

      {/* Delete Modal */}
      <UPFModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, resource: null })}
        title="Supprimer la ressource"
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setDeleteModal({ open: false, resource: null })}>Annuler</UPFButton>
            <UPFButton variant="contained" color="error" onClick={handleDelete}>Supprimer</UPFButton>
          </>
        }
      >
        <Typography>
          Êtes-vous sûr de vouloir supprimer <strong>{deleteModal.resource?.title}</strong> ?
        </Typography>
      </UPFModal>
    </Box>
  );
};

export default AdminCourseResourcesPage;
