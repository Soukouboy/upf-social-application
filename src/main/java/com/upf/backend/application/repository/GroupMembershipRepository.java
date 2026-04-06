package com.upf.backend.application.repository;

import com.upf.backend.application.model.entity.GroupMembership;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupMembershipRepository extends JpaRepository<GroupMembership, UUID> {

    boolean existsByGroup_IdAndStudentProfile_Id(UUID groupId, UUID studentProfileId);

    Optional<GroupMembership> findByGroup_IdAndStudentProfile_Id(UUID groupId, UUID studentProfileId);

    List<GroupMembership> findByGroup_Id(UUID groupId);

    Page<GroupMembership> findByGroup_Id(UUID groupId, Pageable pageable);

    List<GroupMembership> findByStudentProfile_Id(UUID studentProfileId);

    Page<GroupMembership> findByStudentProfile_Id(UUID studentProfileId, Pageable pageable);

    long countByGroup_Id(UUID groupId);

    @Query("SELECT gm FROM GroupMembership gm " +
           "JOIN FETCH gm.studentProfile sp " +
           "JOIN FETCH sp.user " +
           "WHERE gm.group.id = :groupId " +
           "ORDER BY gm.joinedAt ASC")
    Page<GroupMembership> findByGroup_IdWithUserFetch(@Param("groupId") UUID groupId, Pageable pageable);
}