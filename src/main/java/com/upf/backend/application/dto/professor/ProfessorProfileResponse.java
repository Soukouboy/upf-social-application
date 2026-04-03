package com.upf.backend.application.dto.professor;

import java.util.UUID;

/**
 * Réponse pour un profil professeur.
 * Utilisée pour les endpoints de détail (GET, POST, PUT).
 */
public record ProfessorProfileResponse(
    UUID id,
    UUID userId,
    String email,
    String firstName,
    String lastName,
    String department,
    String title,
    String bio
) {}
