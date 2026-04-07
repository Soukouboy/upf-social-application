package com.upf.backend.application.dto.exam;

<<<<<<< HEAD
import java.time.LocalDate;
import java.util.UUID;

import com.upf.backend.application.model.enums.ExamType;

=======
import com.upf.backend.application.model.enums.ExamType;
import java.time.LocalDate;
import java.util.UUID;

>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164
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
