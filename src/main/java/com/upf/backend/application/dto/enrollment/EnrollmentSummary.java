package com.upf.backend.application.dto.enrollment;

<<<<<<< HEAD
import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.EnrollmentStatus;

=======
import com.upf.backend.application.model.enums.EnrollmentStatus;
import java.time.LocalDateTime;
import java.util.UUID;

>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164
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
