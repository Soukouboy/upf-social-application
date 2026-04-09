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

    @Query("""
           select g
           from AcademicGroup g
           where g.isActive = true
             and (:type is null or g.type = :type)
             and (:major is null or lower(cast(g.major as String)) = lower(:major))
             and (
                   :search is null
                   or lower(cast(g.name as String)) like lower(concat('%', :search, '%'))
                   or lower(cast(g.description as String)) like lower(concat('%', :search, '%'))
                 )
           """)
    Page<AcademicGroup> searchActiveGroups(
            @Param("type") GroupType type,
            @Param("major") String major,
            @Param("search") String search,
            Pageable pageable
    );
}