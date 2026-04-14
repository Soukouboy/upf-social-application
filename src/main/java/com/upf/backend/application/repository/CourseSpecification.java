package com.upf.backend.application.repository;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.model.enums.Major;

import java.util.UUID;

@Component
public class CourseSpecification {

    public static Specification<Course> withMajor(Major major) {
        return (root, query, cb) -> major == null ? null :
            cb.equal(root.get("major"), major);
    }

    public static Specification<Course> withYear(Integer year) {
        return (root, query, cb) -> year == null ? null :
            cb.equal(root.get("year"), year);
    }

    public static Specification<Course> withSemester(Integer semester) {
        return (root, query, cb) -> semester == null ? null :
            cb.equal(root.get("semester"), semester);
    }

    public static Specification<Course> withTitle(String title) {
        return (root, query, cb) -> title == null || title.isBlank() ? null :
            cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }

    public static Specification<Course> withDescription(String description) {
        return (root, query, cb) -> description == null || description.isBlank() ? null :
            cb.like(cb.lower(root.get("description")), "%" + description.toLowerCase() + "%");
    }

    public static Specification<Course> withInstructorName(String instructorName) {
        return (root, query, cb) -> instructorName == null || instructorName.isBlank() ? null :
            cb.like(cb.lower(root.get("instructorName")), "%" + instructorName.toLowerCase() + "%");
    }

    public static Specification<Course> isActive(Boolean isActive) {
        return (root, query, cb) -> isActive == null ? null :
            cb.equal(root.get("isActive"), isActive);
    }

    public static Specification<Course> withProfessorId(UUID professorId) {
        return (root, query, cb) -> professorId == null ? null :
            cb.equal(root.join("professor").get("id"), professorId);
    }

    public static Specification<Course> searchByKeyword(String search) {
        return (root, query, cb) -> search == null || search.isBlank() ? null :
            cb.or(
                cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"),
                cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%"),
                cb.like(cb.lower(root.get("instructorName")), "%" + search.toLowerCase() + "%")
            );
    }
}
