package com.upf.backend.application.controller;

import com.upf.backend.application.controller.request.UpdateProfilRequest;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.Interfaces.IUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final IUserService userService;

    public UserController(IUserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<StudentProfile> getCurrentUserProfile(
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        StudentProfile profile = userService.getCurrentUserProfile(currentUser.getProfileId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<StudentProfile> updateMyProfile(
            @AuthenticationPrincipal SecurityUser currentUser,
            @RequestBody UpdateProfilRequest request
    ) {
        StudentProfile updated = userService.updateProfile(
                currentUser.getProfileId(),
                request.bio(),
                request.profilePhotoUrl(),
                request.major(),
                request.currentYear(),
                request.profilePublic()
        );
        return ResponseEntity.ok(updated);
    }
}