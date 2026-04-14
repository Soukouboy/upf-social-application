package com.upf.backend.application.dto.course;

import com.upf.backend.application.dto.professor.ProfessorProfileSummary;
import com.upf.backend.application.model.enums.Major;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Réponse standard pour un cours.
 * Utilisée pour les endpoints de détail (GET /courses/{id}).
 */
public record CourseResponse(
    UUID id,
    String code,
    String title,
    String description,
    Major major,
    int year,
    int semester,
    int credits,
    String objectives,
    String prerequisites,
    ProfessorProfileSummary professor,
    boolean isActive,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
