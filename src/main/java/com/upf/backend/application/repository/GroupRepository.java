package com.upf.backend.application.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.upf.backend.application.model.entity.AcademicGroup;
import com.upf.backend.application.model.enums.GroupType;

import java.util.UUID;

public interface GroupRepository extends JpaRepository<AcademicGroup, UUID> {

    boolean existsByName(String name);

    Page<AcademicGroup> findByTypeAndIsActiveTrue(GroupType type, Pageable pageable);

    Page<AcademicGroup> findByMajorAndIsActiveTrue(String major, Pageable pageable);

    Page<AcademicGroup> findByCreatedBy(UUID createdBy, Pageable pageable);

    @Query(value = """
           SELECT g.id, g.cover_image_url, g.created_at, g.created_by, g.description,
                  g.is_active, g.major, g.member_count, g.message_count, g.name,
                  g.type, g.updated_at
           FROM groups g
           WHERE g.is_active = true
             AND (:type IS NULL OR g.type = :type)
             AND (:major IS NULL OR LOWER(g.major) = LOWER(:major))
             AND (
                   :search IS NULL
                   OR LOWER(g.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(g.description) LIKE LOWER(CONCAT('%', :search, '%'))
                 )
           """,
           countQuery = """
           SELECT COUNT(*)
           FROM groups g
           WHERE g.is_active = true
             AND (:type IS NULL OR g.type = :type)
             AND (:major IS NULL OR LOWER(g.major) = LOWER(:major))
             AND (
                   :search IS NULL
                   OR LOWER(g.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(g.description) LIKE LOWER(CONCAT('%', :search, '%'))
                 )
           """,
           nativeQuery = true)
    Page<AcademicGroup> searchActiveGroups(
            @Param("type") String type,
            @Param("major") String major,
            @Param("search") String search,
            Pageable pageable
    );
}