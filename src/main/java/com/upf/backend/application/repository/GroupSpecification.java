package com.upf.backend.application.repository;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import com.upf.backend.application.model.entity.AcademicGroup;
import com.upf.backend.application.model.enums.GroupType;
import com.upf.backend.application.model.enums.Major;

import java.util.UUID;

@Component
public class GroupSpecification {

    public static Specification<AcademicGroup> withMajor(Major major) {
        return (root, query, cb) -> major == null ? null :
            cb.equal(root.get("major"), major);
    }

    public static Specification<AcademicGroup> withType(GroupType type) {
        return (root, query, cb) -> type == null ? null :
            cb.equal(root.get("type"), type);
    }

    public static Specification<AcademicGroup> isActive(Boolean isActive) {
        return (root, query, cb) -> isActive == null ? null :
            cb.equal(root.get("isActive"), isActive);
    }

    public static Specification<AcademicGroup> withCreatedBy(UUID createdBy) {
        return (root, query, cb) -> createdBy == null ? null :
            cb.equal(root.get("createdBy"), createdBy);
    }

    public static Specification<AcademicGroup> searchByName(String name) {
        return (root, query, cb) -> name == null || name.isBlank() ? null :
            cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<AcademicGroup> searchByDescription(String description) {
        return (root, query, cb) -> description == null || description.isBlank() ? null :
            cb.like(cb.lower(root.get("description")), "%" + description.toLowerCase() + "%");
    }

    public static Specification<AcademicGroup> searchByKeyword(String search) {
        return (root, query, cb) -> search == null || search.isBlank() ? null :
            cb.or(
                cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"),
                cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%")
            );
    }
}
