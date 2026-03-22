import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Skeleton } from '@mui/material';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import UPFSearchBar from '../../components/ui/UPFSearchBar';
import StudentCard from '../../components/network/StudentCard';
import EmptyState from '../../components/common/EmptyState';
import { getUsers } from '../../services/userService';
import type { StudentNetwork } from '../../types';

const NetworkPage: React.FC = () => {
  const [students, setStudents] = useState<StudentNetwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Debounce pour ne pas lancer d'appel API à chaque frappe
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const data = await getUsers(search);
        setStudents(data.content);
      } catch (error) {
        console.error('Erreur lors de la récupération du réseau', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={0.5}>🌐 Réseau UPF</Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Recherchez vos camarades, suivez leurs activités et élargissez votre réseau.
        </Typography>
        
        <UPFSearchBar
          placeholder="Rechercher par nom, prénom ou filière..."
          value={search}
          onChange={setSearch}
          fullWidth
        />
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : students.length === 0 ? (
        <EmptyState 
          title="Aucun étudiant trouvé" 
          description="Essayez de modifier vos termes de recherche." 
          icon={<PersonSearchRoundedIcon />} 
        />
      ) : (
        <Grid container spacing={3}>
          {students.map((student) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={student.id}>
              <StudentCard student={student} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default NetworkPage;
