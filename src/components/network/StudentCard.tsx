import React, { useState } from 'react';
import { Box, Typography, Avatar, useTheme, alpha } from '@mui/material';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import UPFCard from '../ui/UPFCard';
import UPFButton from '../ui/UPFButton';
import type { StudentNetwork } from '../../types';
import { followUser, unfollowUser } from '../../services/userService';

interface StudentCardProps {
  student: StudentNetwork;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  const theme = useTheme();
  const [isFollowing, setIsFollowing] = useState(student.isFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(student.id);
        setIsFollowing(false);
      } else {
        await followUser(student.id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Erreur lors du suivi', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UPFCard sx={{ textAlign: 'center', p: 3 }}>
      <Avatar
        src={student.avatarUrl}
        alt={`${student.firstName} ${student.lastName}`}
        sx={{
          width: 80,
          height: 80,
          mx: 'auto',
          mb: 2,
          border: `3px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      />
      <Typography variant="h6" fontWeight={600} noWrap>
        {student.firstName} {student.lastName}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2} noWrap>
        {student.filiere} • Année {student.annee}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1}>
            {student.followersCount + (isFollowing && !student.isFollowing ? 1 : 0) - (!isFollowing && student.isFollowing ? 1 : 0)}
          </Typography>
          <Typography variant="caption" color="text.secondary">Abonnés</Typography>
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1}>
            {student.followingCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">Abonnements</Typography>
        </Box>
      </Box>

      <UPFButton
        fullWidth
        variant={isFollowing ? "outlined" : "contained"}
        color={isFollowing ? "inherit" : "primary"}
        startIcon={isFollowing ? <CheckRoundedIcon /> : <PersonAddRoundedIcon />}
        onClick={handleFollowToggle}
        loading={loading}
        sx={{
          borderRadius: 50,
        }}
      >
        {isFollowing ? 'Abonné' : 'Suivre'}
      </UPFButton>
    </UPFCard>
  );
};

export default StudentCard;
