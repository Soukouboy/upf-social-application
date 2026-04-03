package com.upf.backend.application.dto.admin;

import com.upf.backend.application.model.enums.AdminLevel;
import java.time.LocalDateTime;
import java.util.UUID;

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
