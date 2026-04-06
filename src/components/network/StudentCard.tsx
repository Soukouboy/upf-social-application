import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, useTheme, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import UPFCard from '../ui/UPFCard';
import UPFButton from '../ui/UPFButton';
import type { StudentNetwork } from '../../types';
import { followUser, unfollowUser } from '../../services/userService';
import { checkFollowStatus } from '../../services/followService';

interface StudentCardProps {
  student: StudentNetwork;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(student.isFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    checkFollowStatus(String(student.id))
      .then((status) => {
        if (active) setIsFollowing(status);
      })
      .catch((err) => console.error('Erreur status follow', err));
    return () => { active = false; };
  }, [student.id]);

  const handleFollowToggle = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(String(student.id));
        setIsFollowing(false);
      } else {
        await followUser(String(student.id));
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Erreur lors du suivi', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    navigate(`/student/messages/${student.id}`);
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

      <Box sx={{ display: 'flex', gap: 1 }}>
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

        {isFollowing && (
          <UPFButton
            variant="outlined"
            color="primary"
            onClick={handleMessage}
            sx={{
              borderRadius: 50,
              minWidth: 44,
              px: 1.5,
            }}
          >
            <ChatRoundedIcon sx={{ fontSize: 18 }} />
          </UPFButton>
        )}
      </Box>
    </UPFCard>
  );
};

export default StudentCard;
