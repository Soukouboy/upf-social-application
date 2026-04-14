package com.upf.backend.application.dto.student;

import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.Major;

/**
 * Réponse détaillée pour un profil étudiant.
 * Extension de StudentProfileResponse avec des métadonnées additionnelles.
 */
public record StudentProfileDetails(
    UUID id,
    UUID userId,
    String email,
    String firstName,
    String lastName,
    Major major,
    int currentYear,
    String profilePictureUrl,
    String bio,
    boolean isProfilePublic,
    LocalDateTime lastLoginAt,
    LocalDateTime createdAt
) {}
