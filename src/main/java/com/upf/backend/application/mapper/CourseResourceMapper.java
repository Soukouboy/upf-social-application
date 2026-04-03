package com.upf.backend.application.mapper;

import com.upf.backend.application.dto.courseresource.CourseResourceResponse;
import com.upf.backend.application.dto.courseresource.CourseResourceSummary;
import com.upf.backend.application.model.entity.CourseResource;

/**
 * Mappeur pour les DTOs CourseResource.
 */
public class CourseResourceMapper {

    /**
     * Convertit une entité CourseResource en CourseResourceResponse.
     */
    public static CourseResourceResponse toResponse(CourseResource resource) {
        if (resource == null) {
            return null;
        }

        String uploadedByName = resource.getUploadedBy() != null
            ? resource.getUploadedBy().getFirstName() + " " + resource.getUploadedBy().getLastName()
            : "Unknown";

        return new CourseResourceResponse(
            resource.getId(),
            resource.getCourse() != null ? resource.getCourse().getId() : null,
            resource.getTitle(),
            resource.getFileUrl(),
            resource.getFileType(),
            resource.getFileSizeBytes(),
            resource.getDownloadCount(),
            resource.isExternal(),
            uploadedByName,
            resource.getCreatedAt()
        );
    }

    /**
     * Convertit une entité CourseResource en CourseResourceSummary.
     */
    public static CourseResourceSummary toSummary(CourseResource resource) {
        if (resource == null) {
            return null;
        }

        return new CourseResourceSummary(
            resource.getId(),
            resource.getTitle(),
            resource.getFileType(),
            resource.getDownloadCount()
        );
    }
}
