package com.upf.backend.application.dto.admin;

import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.AdminLevel;

/**
 * Réponse pour un profil administrateur.
 * Utilisée pour les endpoints de détail.
 */
public record AdminProfileResponse(
    UUID id,
    UUID userId,
    String email,
    String firstName,
    String lastName,
    AdminLevel adminLevel,
    LocalDateTime lastActionAt
) {}
