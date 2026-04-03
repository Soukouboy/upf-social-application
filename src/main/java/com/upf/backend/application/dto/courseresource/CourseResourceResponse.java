package com.upf.backend.application.dto.courseresource;

import com.upf.backend.application.model.enums.FileType;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Réponse pour une ressource de cours.
 * Utilisée pour les endpoints de détail et listes.
 */
public record CourseResourceResponse(
    UUID id,
    UUID courseId,
    String title,
    String fileUrl,
    FileType fileType,
    Long fileSizeBytes,
    int downloadCount,
    boolean isExternal,
    String uploadedByName,
    LocalDateTime createdAt
) {}
