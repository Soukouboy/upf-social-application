package com.upf.backend.application.services.Interfaces;

import java.util.UUID;

import com.upf.backend.application.model.enums.UserRole;

public record AuthTokens(
        String accessToken,
        String refreshToken,
        UUID userId,
        UUID profileId,    // studentId OU adminId OU null selon le rôle
        UserRole role,       // "STUDENT", "ADMIN", etc.
        String email
) {
}