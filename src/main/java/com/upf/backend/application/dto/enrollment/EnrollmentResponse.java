package com.upf.backend.application.dto.enrollment;

import com.upf.backend.application.dto.course.CourseSummary;
import com.upf.backend.application.dto.student.StudentProfileSummary;
import com.upf.backend.application.model.enums.EnrollmentStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Réponse pour une inscription.
 * Utilisée pour les endpoints de détail et listes.
 */
public record EnrollmentResponse(
    UUID id,
    StudentProfileSummary student,
    CourseSummary course,
    EnrollmentStatus status,
    LocalDateTime enrolledAt
) {}
