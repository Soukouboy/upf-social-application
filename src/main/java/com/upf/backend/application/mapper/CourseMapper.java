package com.upf.backend.application.mapper;

import com.upf.backend.application.dto.course.CourseDetails;
import com.upf.backend.application.dto.course.CourseResponse;
import com.upf.backend.application.dto.course.CourseSummary;
import com.upf.backend.application.model.entity.Course;

/**
 * Mappeur pour les DTOs Course.
 */
public class CourseMapper {

    /**
     * Convertit une entité Course en CourseResponse.
     */
    public static CourseResponse toResponse(Course course) {
        if (course == null) {
            return null;
        }

        return new CourseResponse(
            course.getId(),
            course.getCode(),
            course.getTitle(),
            course.getDescription(),
            course.getMajor(),
            course.getYear(),
            course.getSemester(),
            course.getCredits(),
            course.getObjectives(),
            course.getPrerequisites(),
            course.getProfessor() != null ? ProfessorMapper.toSummary(course.getProfessor()) : null,
            course.isActive(),
            course.getCreatedAt(),
            course.getUpdatedAt()
        );
    }

    /**
     * Convertit une entité Course en CourseSummary.
     */
    public static CourseSummary toSummary(Course course) {
        if (course == null) {
            return null;
        }

        String professorName = course.getProfessor() != null
            ? course.getProfessor().getUser().getFirstName() + " " + 
              course.getProfessor().getUser().getLastName()
            : course.getInstructorName();

        return new CourseSummary(
            course.getId(),
            course.getCode(),
            course.getTitle(),
            course.getMajor(),
            course.getYear(),
            course.getSemester(),
            course.getCredits(),
            professorName
        );
    }

    /**
     * Convertit une entité Course en CourseDetails.
     * Inclut toutes les ressources, annonces et métadonnées.
     */
    public static CourseDetails toDetails(Course course) {
        if (course == null) {
            return null;
        }

        return new CourseDetails(
            course.getId(),
            course.getCode(),
            course.getTitle(),
            course.getDescription(),
            course.getMajor(),
            course.getYear(),
            course.getSemester(),
            course.getCredits(),
            course.getObjectives(),
            course.getPrerequisites(),
            course.getProfessor() != null ? ProfessorMapper.toSummary(course.getProfessor()) : null,
            course.isActive(),
            course.getResources() != null 
                ? course.getResources().stream()
                    .map(CourseResourceMapper::toResponse)
                    .toList()
                : java.util.List.of(),
            course.getAnnouncements() != null
                ? course.getAnnouncements().stream()
                    .map(AnnouncementMapper::toResponse)
                    .toList()
                : java.util.List.of(),
            course.getResources() != null ? course.getResources().size() : 0,
            course.getAnnouncements() != null ? course.getAnnouncements().size() : 0,
            course.getCreatedAt(),
            course.getUpdatedAt()
        );
    }
}
