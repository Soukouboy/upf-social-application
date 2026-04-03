package com.upf.backend.application.mapper;

import com.upf.backend.application.dto.announcement.AnnouncementResponse;
import com.upf.backend.application.model.entity.Announcement;

/**
 * Mappeur pour les DTOs Announcement.
 */
public class AnnouncementMapper {

    /**
     * Convertit une entité Announcement en AnnouncementResponse.
     */
    public static AnnouncementResponse toResponse(Announcement announcement) {
        if (announcement == null) {
            return null;
        }

        return new AnnouncementResponse(
            announcement.getId(),
            announcement.getTitle(),
            announcement.getContent(),
            announcement.getCourse() != null ? CourseMapper.toSummary(announcement.getCourse()) : null,
            announcement.getProfessor() != null ? ProfessorMapper.toSummary(announcement.getProfessor()) : null,
            announcement.getCreatedAt()
        );
    }
}
