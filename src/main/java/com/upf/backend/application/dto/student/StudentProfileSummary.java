package com.upf.backend.application.dto.student;

import java.util.UUID;

import com.upf.backend.application.model.enums.Major;

/**
 * Résumé d'un profil étudiant pour les listes et relations imbriquées.
 * Contient uniquement les informations essentielles.
 */
public record StudentProfileSummary(
    UUID id,
    String firstName,
    String lastName,
    Major major,
    int currentYear,
    String profilePictureUrl,
    int followersCount
) {}
