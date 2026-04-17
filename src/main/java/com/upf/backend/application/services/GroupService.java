package com.upf.backend.application.services;


import com.upf.backend.application.model.entity.AcademicGroup;
import com.upf.backend.application.model.entity.GroupMembership;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.enums.GroupType;
import com.upf.backend.application.model.enums.Major;
import com.upf.backend.application.model.enums.RoleMember;
import com.upf.backend.application.repository.GroupMembershipRepository;
import com.upf.backend.application.repository.GroupRepository;
import com.upf.backend.application.repository.StudentRepository;
import com.upf.backend.application.services.Exceptions.AccessDeniedBusinessException;
import com.upf.backend.application.services.Exceptions.BusinessException;
import com.upf.backend.application.services.Exceptions.ResourceNotFoundException;
import com.upf.backend.application.services.Interfaces.IGroupService;
import com.upf.backend.application.model.enums.MembershipStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class GroupService implements IGroupService {

    private final GroupRepository groupRepository;
    private final GroupMembershipRepository membershipRepository;
    private final StudentRepository studentRepository;

    public GroupService(GroupRepository groupRepository,
                            GroupMembershipRepository membershipRepository,
                            StudentRepository studentRepository) {
        this.groupRepository = groupRepository;
        this.membershipRepository = membershipRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public AcademicGroup createGroup(UUID creatorId,
                                     String name,
                                     String description,
                                     GroupType type,
                                     Major major
                                     ) {

        if (name == null || name.isBlank()) {
            throw new BusinessException("Le nom du groupe est obligatoire.");
        }
        if (type == null) {
            throw new BusinessException("Le type du groupe est obligatoire.");
        }
        if (groupRepository.existsByName(name.trim())) {
            throw new BusinessException("Un groupe existe déjà avec ce nom.");
        }

        StudentProfile creator = studentRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Créateur introuvable."));

        AcademicGroup group = new AcademicGroup();
        group.setName(name.trim());
        group.setDescription(description);
        group.setType(type);
        group.setMajor(major);
        group.setCreatedBy(creator.getId());
       
        group.setActive(true);

        // Créer et sauvegarder le groupe d'abord
        AcademicGroup savedGroup = groupRepository.save(group);

        // Ajouter le créateur comme administrateur
        GroupMembership ownerMembership = new GroupMembership();
        ownerMembership.setStudentProfile(creator);
        ownerMembership.setGroup(savedGroup);
        ownerMembership.setRole(RoleMember.ADMIN);

        membershipRepository.save(ownerMembership);
        savedGroup.setMemberCount(1);

        return groupRepository.save(savedGroup);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AcademicGroup> listPublicGroups(Major major,
                                                String search,
                                                Pageable pageable) {
        // Convert Major enum to String (its label) for native query
        String majorLabel = major != null ? major.getLabel() : null;
        return groupRepository.searchActiveGroups(
                majorLabel,
                normalize(search),
                pageable
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AcademicGroup> listMyGroups(UUID studentId, Pageable pageable) {
        studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable."));

        return membershipRepository.findByStudentProfile_Id(studentId, pageable)
                .map(GroupMembership::getGroup);
    }

    @Override
    public GroupMembership joinGroup(UUID groupId, UUID studentId) {
        AcademicGroup group = loadActiveGroup(groupId);

        if (group.getType() != GroupType.PUBLIC) {
            throw new BusinessException("Utilise requestToJoinPrivateGroup pour un groupe privé.");
        }

        return createMembershipIfAbsent(group, studentId);
    }

    @Override
    public GroupMembership requestToJoinPrivateGroup(UUID groupId, UUID studentId) {
        AcademicGroup group = loadActiveGroup(groupId);

        if (group.getType() != GroupType.PRIVATE) {
            throw new BusinessException("Cette opération est réservée aux groupes privés.");
        }

        // Check if membership already exists
        if (membershipRepository.existsByGroup_IdAndStudentProfile_Id(groupId, studentId)) {
            throw new BusinessException("Vous avez déjà une demande ou êtes déjà membre de ce groupe.");
        }

        // Get the student
        StudentProfile student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable."));

        // Create membership with PENDING status for private group join request
        GroupMembership membership = new GroupMembership();
        membership.setGroup(group);
        membership.setStudentProfile(student);
        membership.setRole(RoleMember.MEMBER);
        membership.setStatus(MembershipStatus.PENDING);

        // Save the membership directly (don't increment memberCount for PENDING requests)
        return membershipRepository.save(membership);
    }

    @Override
    public void removeMember(UUID groupId, UUID actorId, UUID memberId) {
        AcademicGroup group = loadActiveGroup(groupId);

        GroupMembership membership = membershipRepository
                .findByGroup_IdAndStudentProfile_Id(groupId, memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Adhésion introuvable."));

        boolean isGroupCreator = group.getCreatedBy().equals(actorId);
        boolean isSelfRemoval = actorId.equals(memberId);

        if (!isGroupCreator && !isSelfRemoval) {
            throw new AccessDeniedBusinessException("Seul le créateur du groupe peut retirer un autre membre.");
        }

        group.removeMembership(membership);
        groupRepository.save(group);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupMembership> listGroupMembers(UUID groupId, Pageable pageable) {
        // Vérifier que le groupe existe et est actif
        loadActiveGroup(groupId);
        
        return membershipRepository.findByGroup_IdWithUserFetch(groupId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicGroup getGroupById(UUID groupId) {
        return loadActiveGroup(groupId);
    }

    private AcademicGroup loadActiveGroup(UUID groupId) {
        AcademicGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable."));

        if (!group.isActive()) {
            throw new ResourceNotFoundException("Groupe introuvable ou inactif.");
        }
        return group;
    }

    private GroupMembership createMembershipIfAbsent(AcademicGroup group, UUID studentId) {
        if (membershipRepository.existsByGroup_IdAndStudentProfile_Id(group.getId(), studentId)) {
            throw new BusinessException("L'étudiant est déjà membre du groupe.");
        }

        StudentProfile student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable."));

        GroupMembership membership = new GroupMembership();
        membership.setStudentProfile(student);
        membership.setRole(RoleMember.MEMBER);

        group.addMembership(membership);

        // Sauvegarder le groupe avec cascade pour persister le membership
        groupRepository.save(group);

        return membership;
    }

    private void deleteGroup(AcademicGroup group) {
        // Suppression en cascade grâce à la relation définie dans AcademicGroup
        groupRepository.delete(group);
    }

    private void deactivateGroup(AcademicGroup group) {
        group.setActive(false);
        groupRepository.save(group);
    }

    private String normalize(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupMembership> getPendingMembershipRequests(UUID groupId, UUID actorId, Pageable pageable) {
        AcademicGroup group = loadActiveGroup(groupId);

        // Vérifier que l'acteur est admin du groupe
        boolean isGroupAdmin = group.getCreatedBy().equals(actorId);
        if (!isGroupAdmin) {
            throw new AccessDeniedBusinessException("Seul l'administrateur du groupe peut voir les demandes en attente.");
        }

        // Retourner les demandes PENDING
        return membershipRepository.findPendingMembershipsForGroup(groupId, pageable);
    }

    @Override
    @Transactional
    public GroupMembership approveMembershipRequest(UUID groupId, UUID membershipId, UUID actorId) {
        AcademicGroup group = loadActiveGroup(groupId);

        // Vérifier que l'acteur est admin du groupe
        if (!group.getCreatedBy().equals(actorId)) {
            throw new AccessDeniedBusinessException("Seul l'administrateur du groupe peut approuver les demandes.");
        }

        // Récupérer la membership
        GroupMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande d'adhésion introuvable."));

        // Vérifier que la membership appartient au groupe
        if (!membership.getGroup().getId().equals(groupId)) {
            throw new BusinessException("Cette demande n'appartient pas à ce groupe.");
        }

        // Vérifier que le statut est PENDING
        if (membership.getStatus() != MembershipStatus.PENDING) {
            throw new BusinessException("Cette demande a déjà été traitée (statut: " + membership.getStatus() + ").");
        }

        // Mettre à jour le statut et incrémenter memberCount
        membership.setStatus(MembershipStatus.ACTIVE);
        group.setMemberCount(group.getMemberCount() + 1);

        groupRepository.save(group);
        return membershipRepository.save(membership);
    }

    @Override
    @Transactional
    public GroupMembership rejectMembershipRequest(UUID groupId, UUID membershipId, UUID actorId) {
        AcademicGroup group = loadActiveGroup(groupId);

        // Vérifier que l'acteur est admin du groupe
        if (!group.getCreatedBy().equals(actorId)) {
            throw new AccessDeniedBusinessException("Seul l'administrateur du groupe peut refuser les demandes.");
        }

        // Récupérer la membership
        GroupMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande d'adhésion introuvable."));

        // Vérifier que la membership appartient au groupe
        if (!membership.getGroup().getId().equals(groupId)) {
            throw new BusinessException("Cette demande n'appartient pas à ce groupe.");
        }

        // Vérifier que le statut est PENDING
        if (membership.getStatus() != MembershipStatus.PENDING) {
            throw new BusinessException("Cette demande a déjà été traitée (statut: " + membership.getStatus() + ").");
        }

        // Mettre à jour le statut à REJECTED
        membership.setStatus(MembershipStatus.REJECTED);
        
        return membershipRepository.save(membership);
    }
}