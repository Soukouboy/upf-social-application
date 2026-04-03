package com.upf.backend.application.dto.enrollment;

import com.upf.backend.application.model.enums.EnrollmentStatus;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Résumé d'une inscription pour les listes simples.
 */
public record EnrollmentSummary(
    UUID id,
    UUID studentId,
    UUID courseId,
    EnrollmentStatus status,
    LocalDateTime enrolledAt
) {}
