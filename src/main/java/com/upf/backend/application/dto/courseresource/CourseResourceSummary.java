package com.upf.backend.application.dto.courseresource;

<<<<<<< HEAD
import java.util.UUID;

import com.upf.backend.application.model.enums.FileType;
=======
import com.upf.backend.application.model.enums.FileType;
import java.util.UUID;
>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164

/**
 * Résumé d'une ressource de cours pour les listes condensées.
 */
public record CourseResourceSummary(
    UUID id,
    String title,
    FileType fileType,
    int downloadCount
) {}
