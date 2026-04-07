package com.upf.backend.application.dto.courseresource;

 
import java.util.UUID;

import com.upf.backend.application.model.enums.FileType;
 

/**
 * Résumé d'une ressource de cours pour les listes condensées.
 */
public record CourseResourceSummary(
    UUID id,
    String title,
    FileType fileType,
    int downloadCount
) {}
