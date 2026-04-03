package com.upf.backend.application.services.Interfaces;

import java.util.List;
import java.util.UUID;

import com.upf.backend.application.model.entity.Follow;
import com.upf.backend.application.model.entity.StudentProfile;

public interface IFollowService {

    Follow followUser(UUID followerId, UUID followedId);
    void unfollowUser(UUID followerId, UUID followedId);
    List<StudentProfile> getFollowers(UUID studentId);
    List<StudentProfile> getFollowing(UUID studentId);
    boolean isFollowing(UUID followerId, UUID followedId);
    long countFollowers(UUID studentId);
    long countFollowing(UUID studentId);
}
