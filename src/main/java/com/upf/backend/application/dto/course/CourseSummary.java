package com.upf.backend.application.dto.course;

import java.util.UUID;

/**
 * Résumé d'un cours pour les listes (GET /courses, GET /courses/me, etc.).
 * Contient uniquement les informations essentielles.
 */
public record CourseSummary(
    UUID id,
    String code,
    String title,
    String major,
    int year,
    int semester,
    int credits,
    String professorName
) {}
