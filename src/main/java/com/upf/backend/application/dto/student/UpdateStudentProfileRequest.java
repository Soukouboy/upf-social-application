package com.upf.backend.application.dto.student;

import jakarta.validation.constraints.Size;

/**
 * Requête de mise à jour du profil étudiant (PUT /users/me).
 * N'expose que les champs modifiables par l'étudiant.
 */
public record UpdateStudentProfileRequest(
    @Size(max = 500, message = "La biographie ne peut pas dépasser 500 caractères")
    String bio,

    @Size(max = 500, message = "L'URL ne peut pas dépasser 500 caractères")
    String profilePhotoUrl,

    @Size(min = 2, max = 100, message = "La filière doit faire entre 2 et 100 caractères")
    String major,

    Integer currentYear,

    Boolean profilePublic
) {}
