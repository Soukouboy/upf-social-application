package com.upf.backend.application.repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import com.upf.backend.application.model.entity.Exam;
import com.upf.backend.application.model.enums.ExamType;
import java.util.UUID;
@Component
public class ExamSpecification {

    public static Specification<Exam> visibleExams() {
        return (root, query, cb) -> cb.isFalse(root.get("isHidden"));
    }

    public static Specification<Exam> withMajor(String major) {
        return (root, query, cb) -> major == null ? null :
            cb.equal(cb.lower(root.join("course").get("major")), major.toLowerCase());
    }

    public static Specification<Exam> withTitle(String title) {
        return (root, query, cb) -> title == null ? null :
            cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }

    public static Specification<Exam> withCourseYear(Integer year) {
        return (root, query, cb) -> year == null ? null :
            cb.equal(root.join("course").get("year"), year);
    }

    public static Specification<Exam> withAcademicYear(String academicYear) {
        return (root, query, cb) -> academicYear == null ? null :
            cb.equal(root.get("academicYear"), academicYear);
    }

    public static Specification<Exam> withExamType(ExamType examType) {
        return (root, query, cb) -> examType == null ? null :
            cb.equal(root.get("examType"), examType);
    }

    public static Specification<Exam> withUploaderId(UUID uploaderId) {
        return (root, query, cb) -> uploaderId == null ? null :
            cb.equal(root.join("uploader").get("id"), uploaderId);
    }
}