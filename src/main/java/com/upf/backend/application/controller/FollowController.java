package com.upf.backend.application.controller;

import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.Interfaces.IFollowService;

@RestController
@RequestMapping("/follows")
@PreAuthorize("hasRole('STUDENT')")
public class FollowController {

    private final IFollowService followService;

    public FollowController(IFollowService followService) {
        this.followService = followService;
    }

    // Suivre un utilisateur
    @PostMapping("/{followedId}")
    public ResponseEntity<Void> follow(Authentication auth,
                                        @PathVariable UUID followedId) {
        UUID followerId = profileId(auth);
        followService.followUser(followerId, followedId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // Se désabonner
    @DeleteMapping("/{followedId}")
    public ResponseEntity<Void> unfollow(Authentication auth,
                                          @PathVariable UUID followedId) {
        followService.unfollowUser(profileId(auth), followedId);
        return ResponseEntity.noContent().build();
    }

    // Mes followers
    @GetMapping("/me/followers")
    public ResponseEntity<List<StudentProfile>> myFollowers(Authentication auth) {
        return ResponseEntity.ok(followService.getFollowers(profileId(auth)));
    }

    // Qui je suis
    @GetMapping("/me/following")
    public ResponseEntity<List<StudentProfile>> myFollowing(Authentication auth) {
        return ResponseEntity.ok(followService.getFollowing(profileId(auth)));
    }

    // Followers d'un autre étudiant (profil public)
    @GetMapping("/{studentId}/followers")
    public ResponseEntity<List<StudentProfile>> followers(@PathVariable UUID studentId) {
        return ResponseEntity.ok(followService.getFollowers(studentId));
    }

    // Est-ce que je suis cet étudiant ?
    @GetMapping("/{followedId}/status")
    public ResponseEntity<Boolean> isFollowing(Authentication auth,
                                                @PathVariable UUID followedId) {
        return ResponseEntity.ok(followService.isFollowing(profileId(auth), followedId));
    }

    private UUID profileId(Authentication auth) {
        return ((SecurityUser) auth.getPrincipal()).getProfileId();
    }
}
