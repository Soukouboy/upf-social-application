package com.upf.backend.application.dto.courseresource;

import com.upf.backend.application.model.enums.FileType;
import java.util.UUID;

/**
 * Résumé d'une ressource de cours pour les listes condensées.
 */
public record CourseResourceSummary(
    UUID id,
    String title,
    FileType fileType,
    int downloadCount
) {}
