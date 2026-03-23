package com.upf.backend.application.services.Interfaces;

import java.util.UUID;

public record AuthTokens(
        String accessToken,
        String refreshToken,
        UUID userId,
        UUID studentId,
        String email
) {
}