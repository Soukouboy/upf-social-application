package com.upf.backend.application.dto.professor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Requête de création d'un compte professeur (POST /admin/professors).
 * Utilise la même structure que dans AdminController.
 */
public record CreateProfessorRequest(
    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 80, message = "Le prénom doit faire entre 2 et 80 caractères")
    String firstName,

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 80, message = "Le nom doit faire entre 2 et 80 caractères")
    String lastName,

    @NotBlank(message = "L'email est obligatoire")
    @Size(max = 150, message = "L'email ne peut pas dépasser 150 caractères")
    String email,

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, max = 255, message = "Le mot de passe doit faire entre 8 et 255 caractères")
    String password,

    @Size(max = 100, message = "Le département ne peut pas dépasser 100 caractères")
    String department,

    @Size(max = 50, message = "Le titre ne peut pas dépasser 50 caractères")
    String title,

    java.util.List<java.util.UUID> courseIds
) {}
