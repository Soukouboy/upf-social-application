package com.upf.backend.application.dto.admin;

import com.upf.backend.application.model.enums.AdminLevel;
import java.util.UUID;

/**
 * Résumé d'un profil administrateur pour les listes.
 */
public record AdminProfileSummary(
    UUID id,
    String firstName,
    String lastName,
    AdminLevel adminLevel
) {}
