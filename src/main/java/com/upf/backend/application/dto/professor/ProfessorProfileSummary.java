package com.upf.backend.application.dto.professor;

import java.util.UUID;

/**
 * Résumé d'un profil professeur pour les listes et relations imbriquées.
 */
public record ProfessorProfileSummary(
    UUID id,
    String firstName,
    String lastName,
    String department,
    String title
) {}
