package com.upf.backend.application.dto.course;

import java.util.UUID;

import com.upf.backend.application.model.enums.Major;

/**
 * Résumé d'un cours pour les listes (GET /courses, GET /courses/me, etc.).
 * Contient uniquement les informations essentielles.
 */
public record CourseSummary(
    UUID id,
    String code,
    String title,
    Major major,
    int year,
    int semester,
    int credits,
    String professorName
) {}
