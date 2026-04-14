package com.upf.backend.application.dto.course;

import com.upf.backend.application.dto.announcement.AnnouncementResponse;
import com.upf.backend.application.dto.courseresource.CourseResourceResponse;
import com.upf.backend.application.dto.professor.ProfessorProfileSummary;
import com.upf.backend.application.model.enums.Major;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Réponse détaillée pour un cours.
 * Inclut les ressources, annonces et toutes les métadonnées.
 */
public record CourseDetails(
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
    List<CourseResourceResponse> resources,
    List<AnnouncementResponse> announcements,
    int resourceCount,
    int announcementCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
