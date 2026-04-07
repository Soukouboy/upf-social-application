package com.upf.backend.application.dto.exam;


import java.time.LocalDate;
import java.util.UUID;

import com.upf.backend.application.model.enums.ExamType;

 
/**
 * Résumé d'un examen pour les listes (GET /exams).
 * Contient uniquement les informations essentielles.
 */
public record ExamSummary(
    UUID id,
    String title,
    String academicYear,
    ExamType examType,
    LocalDate examDate,
    String uploaderName,
    String courseName,
    int downloadCount,
    int upvoteCount,
    int downvoteCount
) {}
