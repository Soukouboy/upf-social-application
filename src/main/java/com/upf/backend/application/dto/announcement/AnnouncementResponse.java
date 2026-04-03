package com.upf.backend.application.dto.announcement;

import com.upf.backend.application.dto.course.CourseSummary;
import com.upf.backend.application.dto.professor.ProfessorProfileSummary;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Réponse pour une annonce.
 * Utilisée pour les endpoints de détail et listes.
 */
public record AnnouncementResponse(
    UUID id,
    String title,
    String content,
    CourseSummary course,
    ProfessorProfileSummary professor,
    LocalDateTime createdAt
) {}
