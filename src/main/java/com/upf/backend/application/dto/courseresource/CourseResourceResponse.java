package com.upf.backend.application.dto.courseresource;

<<<<<<< HEAD
import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.FileType;

=======
import com.upf.backend.application.model.enums.FileType;
import java.time.LocalDateTime;
import java.util.UUID;

>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164
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
