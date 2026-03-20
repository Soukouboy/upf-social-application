package com.upf.backend.application.services.Interfaces;


import com.upf.backend.application.model.entity.AcademicGroup;
import com.upf.backend.application.model.entity.GroupMembership;
import com.upf.backend.application.model.enums.GroupType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface IGroupService {

    AcademicGroup createGroup(UUID creatorId,
                              String name,
                              String description,
                              GroupType type,
                              String major,
                              String coverImageUrl);

    Page<AcademicGroup> listPublicGroups(String major,
                                         String search,
                                         Pageable pageable);

    Page<AcademicGroup> listMyGroups(UUID studentId, Pageable pageable);

    GroupMembership joinGroup(UUID groupId, UUID studentId);

    GroupMembership requestToJoinPrivateGroup(UUID groupId, UUID studentId);

    void removeMember(UUID groupId, UUID actorId, UUID memberId);

}
