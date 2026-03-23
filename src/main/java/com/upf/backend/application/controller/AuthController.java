package com.upf.backend.application.controller;

import com.upf.backend.application.controller.request.LoginRequest;
import com.upf.backend.application.controller.request.RefreshTokenRequest;
import com.upf.backend.application.controller.request.RegisterStudentRequest;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.services.Interfaces.IAuthService;
import com.upf.backend.application.services.Interfaces.AuthTokens;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final IAuthService authService;

    public AuthController(IAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<StudentProfile> register(@RequestBody RegisterStudentRequest request) {
        StudentProfile created = authService.registerStudent(
                request.email(),
                request.password(),
                request.major(),
                request.currentYear()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
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
}