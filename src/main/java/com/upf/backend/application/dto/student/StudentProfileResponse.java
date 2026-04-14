package com.upf.backend.application.dto.student;

import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.Major;
import com.upf.backend.application.model.enums.UserRole;

/**
 * Réponse standard pour un profil étudiant.
 * Utilisée pour les endpoints de détail (GET /users/me, PUT /users/me).
 * Inclut les informations complètes sans récursion.
 */
public record StudentProfileResponse(
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
    UserRole role
) {}
