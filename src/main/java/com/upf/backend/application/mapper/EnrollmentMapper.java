package com.upf.backend.application.mapper;

import com.upf.backend.application.dto.enrollment.EnrollmentResponse;
import com.upf.backend.application.dto.enrollment.EnrollmentSummary;
import com.upf.backend.application.model.entity.Enrollment;

/**
 * Mappeur pour les DTOs Enrollment.
 */
public class EnrollmentMapper {

    /**
     * Convertit une entité Enrollment en EnrollmentResponse.
     */
    public static EnrollmentResponse toResponse(Enrollment enrollment) {
        if (enrollment == null) {
            return null;
        }

        return new EnrollmentResponse(
            enrollment.getId(),
            enrollment.getStudentProfile() != null ? StudentMapper.toSummary(enrollment.getStudentProfile()) : null,
            enrollment.getCourse() != null ? CourseMapper.toSummary(enrollment.getCourse()) : null,
            enrollment.getStatus(),
            enrollment.getEnrolledAt()
        );
    }

    /**
     * Convertit une entité Enrollment en EnrollmentSummary.
     */
    public static EnrollmentSummary toSummary(Enrollment enrollment) {
        if (enrollment == null) {
            return null;
        }

        return new EnrollmentSummary(
            enrollment.getId(),
            enrollment.getStudentProfile() != null ? enrollment.getStudentProfile().getId() : null,
            enrollment.getCourse() != null ? enrollment.getCourse().getId() : null,
            enrollment.getStatus(),
            enrollment.getEnrolledAt()
        );
    }
}
