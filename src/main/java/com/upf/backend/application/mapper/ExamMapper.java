package com.upf.backend.application.mapper;

import com.upf.backend.application.dto.exam.ExamDetails;
import com.upf.backend.application.dto.exam.ExamResponse;
import com.upf.backend.application.dto.exam.ExamSummary;
import com.upf.backend.application.model.entity.Exam;

/**
 * Mappeur pour les DTOs Exam.
 */
public class ExamMapper {

    /**
     * Convertit une entité Exam en ExamResponse.
     */
    public static ExamResponse toResponse(Exam exam) {
        if (exam == null) {
            return null;
        }

        return new ExamResponse(
            exam.getId(),
            exam.getTitle(),
            exam.getDescription(),
            exam.getAcademicYear(),
            exam.getExamType(),
            exam.getExamDate(),
            exam.getUploader() != null ? StudentMapper.toSummary(exam.getUploader()) : null,
            exam.getCourse() != null ? CourseMapper.toSummary(exam.getCourse()) : null,
            exam.getFileSizeBytes(),
            exam.getDownloadCount(),
            exam.getUpvoteCount(),
            exam.getDownvoteCount(),
            exam.isHidden(),
            exam.getCreatedAt()
        );
    }

    /**
     * Convertit une entité Exam en ExamSummary.
     */
    public static ExamSummary toSummary(Exam exam) {
        if (exam == null) {
            return null;
        }

        String uploaderName = exam.getUploader() != null && exam.getUploader().getUser() != null
            ? exam.getUploader().getUser().getFirstName() + " " + exam.getUploader().getUser().getLastName()
            : "Unknown";

        String courseName = exam.getCourse() != null ? exam.getCourse().getTitle() : "Unknown";

        return new ExamSummary(
            exam.getId(),
            exam.getTitle(),
            exam.getAcademicYear(),
            exam.getExamType(),
            exam.getExamDate(),
            uploaderName,
            courseName,
            exam.getDownloadCount(),
            exam.getUpvoteCount(),
            exam.getDownvoteCount()
        );
    }

    /**
     * Convertit une entité Exam en ExamDetails.
     */
    public static ExamDetails toDetails(Exam exam) {
        if (exam == null) {
            return null;
        }

        return new ExamDetails(
            exam.getId(),
            exam.getTitle(),
            exam.getDescription(),
            exam.getAcademicYear(),
            exam.getExamType(),
            exam.getExamDate(),
            exam.getUploader() != null ? StudentMapper.toSummary(exam.getUploader()) : null,
            exam.getCourse() != null ? CourseMapper.toSummary(exam.getCourse()) : null,
            exam.getFileUrl(),
            exam.getFileHash(),
            exam.getFileSizeBytes(),
            exam.getDownloadCount(),
            exam.getUpvoteCount(),
            exam.getDownvoteCount(),
            exam.isHidden(),
            exam.getCreatedAt()
        );
    }
}
