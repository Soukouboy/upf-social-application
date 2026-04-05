/**
 * ProfessorAnnouncementsPage — Annonces du professeur
 */
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, MenuItem, useTheme, alpha, Divider,
} from '@mui/material';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import UPFCard from '../../components/ui/UPFCard';
import UPFButton from '../../components/ui/UPFButton';
import UPFModal from '../../components/ui/UPFModal';
import UPFChip from '../../components/ui/UPFChip';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import type { Course, Announcement } from '../../types';
import { getMyCourses, getMyAnnouncements, createAnnouncement } from '../../services/professorService';

const ProfessorAnnouncementsPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [filterCourse, setFilterCourse] = useState<number | 'ALL'>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [c, a] = await Promise.all([getMyCourses(), getMyAnnouncements()]);
        setCourses(c);
        setAnnouncements(a);
      } catch {
        const mockCourses: Course[] = [
          { id: 1, code: 'INF301', title: 'Algorithmique avancée', description: '', filiere: 'GI', annee: 3, semestre: 5, createdAt: '' },
          { id: 2, code: 'INF302', title: 'Programmation Web', description: '', filiere: 'GI', annee: 3, semestre: 5, createdAt: '' },
        ];
        setCourses(mockCourses);
        setAnnouncements([
          { id: 1, courseId: 1, courseTitle: 'Algorithmique avancée', title: 'Report du TP 3', content: 'Le TP 3 est reporté au lundi prochain suite à un problème de salle. Préparez vos exercices de la série 4.', authorName: `Pr. ${user?.lastName}`, createdAt: new Date(Date.now() - 86400000).toISOString() },
          { id: 2, courseId: 2, courseTitle: 'Programmation Web', title: 'Projet final — Sujet disponible', content: 'Le sujet du projet final est maintenant disponible dans les documents du cours. Date limite : 15 avril.', authorName: `Pr. ${user?.lastName}`, createdAt: new Date(Date.now() - 172800000).toISOString() },
          { id: 3, courseId: 1, courseTitle: 'Algorithmique avancée', title: 'Résultats du CC', content: 'Les résultats du contrôle continu sont disponibles. Consultez votre espace étudiant.', authorName: `Pr. ${user?.lastName}`, createdAt: new Date(Date.now() - 604800000).toISOString() },
        ]);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const handleCreate = async () => {
    if (!selectedCourse || !title.trim() || !content.trim()) return;
    setCreating(true);
    try {
      const newAnn = await createAnnouncement(selectedCourse, title, content);
      setAnnouncements((prev) => [newAnn, ...prev]);
    } catch {
      const courseTitle = courses.find((c) => c.id === selectedCourse)?.title || '';
      setAnnouncements((prev) => [{
        id: Date.now(), courseId: selectedCourse, courseTitle, title, content,
        authorName: `Pr. ${user?.lastName}`, createdAt: new Date().toISOString(),
      }, ...prev]);
    } finally {
      setCreating(false);
      setCreateOpen(false);
      setTitle('');
      setContent('');
      setSelectedCourse(0);
    }
  };

  const filtered = filterCourse === 'ALL'
    ? announcements
    : announcements.filter((a) => a.courseId === filterCourse);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CampaignRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>📢 Annonces</Typography>
            <Typography variant="body2" color="text.secondary">
              Communiquez avec vos étudiants
            </Typography>
          </Box>
        </Box>
        <UPFButton variant="contained" startIcon={<SendRoundedIcon />} onClick={() => setCreateOpen(true)}>
          Nouvelle annonce
        </UPFButton>
      </Box>

      {/* Filtre par cours */}
      <UPFCard noHover sx={{ mb: 3 }}>
        <TextField select size="small" label="Filtrer par cours" value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))} sx={{ minWidth: 250 }}>
          <MenuItem value="ALL">Tous les cours</MenuItem>
          {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.code} — {c.title}</MenuItem>)}
        </TextField>
      </UPFCard>

      {/* Liste des annonces */}
      {loading ? (
        <Typography color="text.secondary">Chargement…</Typography>
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucune annonce" description="Créez votre première annonce pour vos étudiants" icon={<CampaignRoundedIcon />} />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map((a) => (
            <UPFCard key={a.id} noHover>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>{a.title}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                    <UPFChip label={a.courseTitle} size="small" colorVariant="primary" />
                    <Typography variant="caption" color="text.secondary">{formatDate(a.createdAt)}</Typography>
                  </Box>
                </Box>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {a.content}
              </Typography>
            </UPFCard>
          ))}
        </Box>
      )}

      {/* Create Modal */}
      <UPFModal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouvelle annonce"
        actions={
          <>
            <UPFButton variant="outlined" onClick={() => setCreateOpen(false)}>Annuler</UPFButton>
            <UPFButton variant="contained" onClick={handleCreate} loading={creating}
              disabled={!selectedCourse || !title.trim() || !content.trim()}>
              Publier
            </UPFButton>
          </>
        }>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Cours" value={selectedCourse || ''} onChange={(e) => setSelectedCourse(Number(e.target.value))} select size="small" required>
            <MenuItem value="" disabled>Sélectionner un cours…</MenuItem>
            {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.code} — {c.title}</MenuItem>)}
          </TextField>
          <TextField label="Titre de l'annonce" value={title} onChange={(e) => setTitle(e.target.value)} size="small" required
            placeholder="Ex: Report du TP 3" />
          <TextField label="Contenu" value={content} onChange={(e) => setContent(e.target.value)} size="small" multiline rows={4} required
            placeholder="Détaillez votre annonce ici…" />
        </Box>
      </UPFModal>
    </Box>
  );
};

export default ProfessorAnnouncementsPage;
