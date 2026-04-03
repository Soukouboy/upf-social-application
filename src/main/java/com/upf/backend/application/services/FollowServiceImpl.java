package com.upf.backend.application.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.upf.backend.application.model.entity.Follow;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.repository.FollowRepository;
import com.upf.backend.application.repository.StudentRepository;
import com.upf.backend.application.services.Exceptions.BusinessException;
import com.upf.backend.application.services.Exceptions.ResourceNotFoundException;
import com.upf.backend.application.services.Interfaces.IFollowService;

@Service
@Transactional
public class FollowServiceImpl implements IFollowService {

    private final FollowRepository followRepository;
    private final StudentRepository studentRepository;
    private final NotificationService notificationService;

    public FollowServiceImpl(FollowRepository followRepository,
                              StudentRepository studentRepository,
                              NotificationService notificationService) {
        this.followRepository    = followRepository;
        this.studentRepository   = studentRepository;
        this.notificationService = notificationService;
    }

    @Override
    public Follow followUser(UUID followerId, UUID followedId) {
        if (followerId.equals(followedId)) {
            throw new BusinessException("Vous ne pouvez pas vous suivre vous-même.");
        }

        if (followRepository.existsByFollower_IdAndFollowing_Id(followerId, followedId)) {
            throw new BusinessException("Vous suivez déjà cet utilisateur.");
        }

        StudentProfile follower = findStudentOrThrow(followerId);
        StudentProfile followed = findStudentOrThrow(followedId);

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowing(followed);
        Follow saved = followRepository.save(follow);

        // ✅ Notification au suivi
        notificationService.notifyNewFollower(
            followed.getUser(),
            follower.getUser()
        );

        return saved;
    }

    @Override
    public void unfollowUser(UUID followerId, UUID followedId) {
        if (!followRepository.existsByFollower_IdAndFollowing_Id(followerId, followedId)) {
            throw new ResourceNotFoundException("Vous ne suivez pas cet utilisateur.");
        }
        followRepository.deleteByFollower_IdAndFollowing_Id(followerId, followedId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentProfile> getFollowers(UUID studentId) {
        return followRepository.findByFollowing_Id(studentId)
                .stream()
                .map(Follow::getFollower)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentProfile> getFollowing(UUID studentId) {
        return followRepository.findByFollower_Id(studentId)
                .stream()
                .map(Follow::getFollowing)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFollowing(UUID followerId, UUID followedId) {
        return followRepository.existsByFollower_IdAndFollowing_Id(followerId, followedId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countFollowers(UUID studentId) {
        return followRepository.countByFollowing_Id(studentId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countFollowing(UUID studentId) {
        return followRepository.countByFollower_Id(studentId);
    }

    private StudentProfile findStudentOrThrow(UUID studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable."));
    }
}