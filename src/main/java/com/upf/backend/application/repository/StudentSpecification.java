package com.upf.backend.application.repository;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.enums.Major;

import java.util.UUID;

@Component
public class StudentSpecification {

    public static Specification<StudentProfile> withMajor(Major major) {
        return (root, query, cb) -> major == null ? null :
            cb.equal(root.get("major"), major);
    }

    public static Specification<StudentProfile> withCurrentYear(Integer currentYear) {
        return (root, query, cb) -> currentYear == null ? null :
            cb.equal(root.get("currentYear"), currentYear);
    }

    public static Specification<StudentProfile> isProfilePublic(Boolean isPublic) {
        return (root, query, cb) -> isPublic == null ? null :
            cb.equal(root.get("isProfilePublic"), isPublic);
    }

    public static Specification<StudentProfile> withUserId(UUID userId) {
        return (root, query, cb) -> userId == null ? null :
            cb.equal(root.join("user").get("id"), userId);
    }

    public static Specification<StudentProfile> withEmail(String email) {
        return (root, query, cb) -> email == null || email.isBlank() ? null :
            cb.equal(root.join("user").get("email"), email);
    }

    public static Specification<StudentProfile> searchByFirstName(String firstName) {
        return (root, query, cb) -> firstName == null || firstName.isBlank() ? null :
            cb.like(cb.lower(root.join("user").get("firstName")), "%" + firstName.toLowerCase() + "%");
    }

    public static Specification<StudentProfile> searchByLastName(String lastName) {
        return (root, query, cb) -> lastName == null || lastName.isBlank() ? null :
            cb.like(cb.lower(root.join("user").get("lastName")), "%" + lastName.toLowerCase() + "%");
    }
}
