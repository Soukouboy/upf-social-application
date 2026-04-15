package com.upf.backend.application.controller;

import com.upf.backend.application.controller.request.LoginRequest;
import com.upf.backend.application.controller.request.RefreshTokenRequest;
import com.upf.backend.application.controller.request.RegisterStudentRequest;
import com.upf.backend.application.dto.student.StudentProfileResponse;
import com.upf.backend.application.mapper.StudentMapper;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.enums.Major;
import com.upf.backend.application.services.Interfaces.IAuthService;
import com.upf.backend.application.services.Interfaces.AuthTokens;
import com.upf.backend.application.security.SecurityUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final IAuthService authService;

    public AuthController(IAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<StudentProfileResponse> register(@RequestBody RegisterStudentRequest request) {
        StudentProfile created = authService.registerStudent(
                request.firstName(),
                request.lastName(),
                request.email(),
                request.password(),
                Major.fromString(request.major()),
                request.currentYear()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(StudentMapper.toResponse(created));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthTokens> login(@RequestBody LoginRequest request) {
        AuthTokens tokens = authService.authenticate(
                request.email(),
                request.password()
        );
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthTokens> refresh(@RequestBody RefreshTokenRequest request) {
        AuthTokens tokens = authService.refreshToken(request.refreshToken());
        return ResponseEntity.ok(tokens);
    }

    @GetMapping("/test-auth")
    public ResponseEntity<String> testAuth(@AuthenticationPrincipal SecurityUser currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body("❌ No authentication found");
        }
        return ResponseEntity.ok("✅ Authenticated as: " + currentUser.getUsername() + 
                " | ProfileId: " + currentUser.getProfileId() + 
                " | Authorities: " + currentUser.getAuthorities());
    }
}