package com.upf.backend.application.dto.enrollment;
 
import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.EnrollmentStatus;
 
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
