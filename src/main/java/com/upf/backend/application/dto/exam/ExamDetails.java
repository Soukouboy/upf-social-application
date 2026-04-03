package com.upf.backend.application.dto.exam;

import com.upf.backend.application.dto.course.CourseSummary;
import com.upf.backend.application.dto.student.StudentProfileSummary;
import com.upf.backend.application.model.enums.ExamType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Réponse détaillée pour un examen.
 * Inclut les métadonnées complètes (fileHash pour détection de doublons, etc.).
 */
public record ExamDetails(
    UUID id,
    String title,
    String description,
    String academicYear,
    ExamType examType,
    LocalDate examDate,
    StudentProfileSummary uploader,
    CourseSummary course,
    String fileUrl,
    String fileHash,
    Long fileSizeBytes,
    int downloadCount,
    int upvoteCount,
    int downvoteCount,
    boolean isHidden,
    LocalDateTime createdAt
) {}
