package com.upf.backend.application.dto.exam;

import com.upf.backend.application.dto.course.CourseSummary;
import com.upf.backend.application.dto.student.StudentProfileSummary;
import com.upf.backend.application.model.enums.ExamType;
<<<<<<< HEAD

=======
>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Réponse pour un examen.
 * Utilisée pour les endpoints de détail (GET /exams/{id}).
 */
public record ExamResponse(
    UUID id,
    String title,
    String description,
    String academicYear,
    ExamType examType,
    LocalDate examDate,
    StudentProfileSummary uploader,
    CourseSummary course,
    Long fileSizeBytes,
    int downloadCount,
    int upvoteCount,
    int downvoteCount,
    boolean isHidden,
    LocalDateTime createdAt
) {}
