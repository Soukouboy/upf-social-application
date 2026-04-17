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

    /**
     * Récupère les demandes d'adhésion en attente (PENDING) pour un groupe privé.
     * Seul l'administrateur du groupe peut accéder à cette liste.
     * 
     * @param groupId UUID du groupe
     * @param actorId UUID de l'administrateur du groupe
     * @param pageable pagination
     * @return Page de demandes en attente
     */
    Page<GroupMembership> getPendingMembershipRequests(UUID groupId, UUID actorId, Pageable pageable);

    /**
     * Approuve une demande d'adhésion (change le statut de PENDING à ACTIVE).
     * Seul l'administrateur du groupe peut approuver.
     * 
     * @param groupId UUID du groupe
     * @param membershipId UUID de la demande
     * @param actorId UUID de l'administrateur du groupe
     * @return La membership approuvée
     */
    GroupMembership approveMembershipRequest(UUID groupId, UUID membershipId, UUID actorId);

    /**
     * Refuse une demande d'adhésion (change le statut de PENDING à REJECTED).
     * Seul l'administrateur du groupe peut refuser.
     * 
     * @param groupId UUID du groupe
     * @param membershipId UUID de la demande
     * @param actorId UUID de l'administrateur du groupe
     * @return La membership refusée
     */
    GroupMembership rejectMembershipRequest(UUID groupId, UUID membershipId, UUID actorId);
}
