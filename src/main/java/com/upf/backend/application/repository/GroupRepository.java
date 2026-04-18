package com.upf.backend.application.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.upf.backend.application.model.entity.AcademicGroup;
import com.upf.backend.application.model.enums.GroupType;
import com.upf.backend.application.model.enums.Major;

import java.util.UUID;

public interface GroupRepository extends JpaRepository<AcademicGroup, UUID>,
        JpaSpecificationExecutor<AcademicGroup> {

    boolean existsByName(String name);

    Page<AcademicGroup> findByTypeAndIsActiveTrue(GroupType type, Pageable pageable);

    Page<AcademicGroup> findByMajorAndIsActiveTrue(Major major, Pageable pageable);

    Page<AcademicGroup> findByCreatedBy(UUID createdBy, Pageable pageable);

    @Query(value = """
           SELECT g.id, g.cover_image_url, g.created_at, g.created_by, g.description,
                  g.is_active, g.major, g.member_count, g.message_count, g.name,
                  g.type, g.updated_at
           FROM groups g
           WHERE g.is_active = true
             AND (g.type = 'PUBLIC' OR g.type = 'PRIVATE')
             AND (:major IS NULL OR g.major = :major)
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
             AND (g.type = 'PUBLIC' OR g.type = 'PRIVATE')
             AND (:major IS NULL OR g.major = :major)
             AND (
                   :search IS NULL
                   OR LOWER(g.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(g.description) LIKE LOWER(CONCAT('%', :search, '%'))
                 )
           """,
           nativeQuery = true)
    Page<AcademicGroup> searchActiveGroups(
            @Param("major") String major,
            @Param("search") String search,
            Pageable pageable
    );

    /**
     * Incrémente le compteur de messages du groupe de manière native.
     * Évite les problèmes de cascade et de synchronisation Hibernate.
     */
    @Modifying
    @Query(value = "UPDATE groups SET message_count = message_count + 1 WHERE id = :groupId",
           nativeQuery = true)
    void incrementMessageCount(@Param("groupId") java.util.UUID groupId);

    /**
     * Incrémente le compteur de membres du groupe de manière native.
     * Évite les problèmes de cascade et de synchronisation Hibernate.
     */
    @Modifying
    @Query(value = "UPDATE groups SET member_count = member_count + 1 WHERE id = :groupId",
           nativeQuery = true)
    void incrementMemberCount(@Param("groupId") java.util.UUID groupId);

    /**
     * Décrémente le compteur de membres du groupe de manière native.
     * Évite les problèmes de cascade et de synchronisation Hibernate.
     */
    @Modifying
    @Query(value = "UPDATE groups SET member_count = CASE WHEN member_count > 0 THEN member_count - 1 ELSE 0 END WHERE id = :groupId",
           nativeQuery = true)
    void decrementMemberCount(@Param("groupId") java.util.UUID groupId);
}