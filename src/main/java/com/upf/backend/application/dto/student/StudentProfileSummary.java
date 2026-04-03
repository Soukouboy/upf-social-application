package com.upf.backend.application.dto.student;

import java.util.UUID;

/**
 * Résumé d'un profil étudiant pour les listes et relations imbriquées.
 * Contient uniquement les informations essentielles.
 */
public record StudentProfileSummary(
    UUID id,
    String firstName,
    String lastName,
    String major,
    int currentYear,
    String profilePictureUrl
) {}
