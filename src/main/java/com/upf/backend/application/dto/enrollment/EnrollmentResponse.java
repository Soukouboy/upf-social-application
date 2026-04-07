package com.upf.backend.application.dto.enrollment;

import com.upf.backend.application.dto.course.CourseSummary;
import com.upf.backend.application.dto.student.StudentProfileSummary;
import com.upf.backend.application.model.enums.EnrollmentStatus;
<<<<<<< HEAD

=======
>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164
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
