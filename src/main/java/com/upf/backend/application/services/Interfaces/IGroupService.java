package com.upf.backend.application.services.Interfaces;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.upf.backend.application.model.entity.AcademicGroup;
import com.upf.backend.application.model.entity.GroupMembership;
import com.upf.backend.application.model.enums.GroupType;
import com.upf.backend.application.model.enums.Major;

import java.util.UUID;

public interface IGroupService {

    AcademicGroup createGroup(UUID creatorId,
                              String name,
                              String description,
                              GroupType type,
                              Major major
                           );

    Page<AcademicGroup> listPublicGroups(Major major,
                                         String search,
                                         Pageable pageable);

    Page<AcademicGroup> listMyGroups(UUID studentId, Pageable pageable);

    GroupMembership joinGroup(UUID groupId, UUID studentId);

    GroupMembership requestToJoinPrivateGroup(UUID groupId, UUID studentId);

    void removeMember(UUID groupId, UUID actorId, UUID memberId);

    Page<GroupMembership> listGroupMembers(UUID groupId, Pageable pageable);

    AcademicGroup getGroupById(UUID groupId);

}
