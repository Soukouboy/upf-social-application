package com.upf.backend.application.dto.student;

import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.Major;

/**
 * Réponse pour consulter le profil public d'un autre étudiant.
 * N'expose que les informations publiques.
 */
public record StudentPublicProfileResponse(
    UUID id,
    String firstName,
    String lastName,
    Major major,
    int currentYear,
    String profilePictureUrl,
    String bio,
    LocalDateTime lastLoginAt
) {}