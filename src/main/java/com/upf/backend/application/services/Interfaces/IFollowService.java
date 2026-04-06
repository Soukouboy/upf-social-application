package com.upf.backend.application.services.Interfaces;

import java.util.List;
import java.util.UUID;

import com.upf.backend.application.dto.student.StudentProfileSummary;
import com.upf.backend.application.model.entity.Follow;

public interface IFollowService {

    Follow followUser(UUID followerId, UUID followedId);
    void unfollowUser(UUID followerId, UUID followedId);
    List<StudentProfileSummary> getFollowers(UUID studentId);
    List<StudentProfileSummary> getFollowing(UUID studentId);
    boolean isFollowing(UUID followerId, UUID followedId);
    long countFollowers(UUID studentId);
    long countFollowing(UUID studentId);
}
