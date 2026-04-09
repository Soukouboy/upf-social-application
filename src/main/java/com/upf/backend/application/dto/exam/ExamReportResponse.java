package com.upf.backend.application.dto.exam;

import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.ReportReason;
import com.upf.backend.application.model.enums.ReportStatus;

/**
 * Réponse pour les signalements d'examens dans l'admin dashboard.
 */
public record ExamReportResponse(
    UUID id,
    UUID examId,
    String examTitle,
    UUID reporterId,
    String reporterName,
    ReportReason reason,
    ReportStatus status,
    String description,
    LocalDateTime createdAt
) {}