package com.upf.backend.application.controller;

import com.upf.backend.application.controller.request.CreateGroupRequest;
import com.upf.backend.application.dto.group.AcademicGroupResponse;
import com.upf.backend.application.dto.group.GroupDetailResponse;
import com.upf.backend.application.dto.group.GroupMembershipResponse;
import com.upf.backend.application.mapper.GroupMapper;
import com.upf.backend.application.model.entity.AcademicGroup;
import com.upf.backend.application.model.entity.GroupMembership;
import com.upf.backend.application.model.enums.Major;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.GroupService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public ResponseEntity<AcademicGroupResponse> createGroup(
             @AuthenticationPrincipal SecurityUser currentUser,
            @RequestBody CreateGroupRequest request
    ) {
        AcademicGroup created = groupService.createGroup(
                currentUser.getProfileId(),
                request.name(),
                request.description(),
                request.type(),
                Major.fromString(request.major())
        );
        return ResponseEntity.status(201).body(GroupMapper.toResponse(created));
    }

    @GetMapping("/public")
    public ResponseEntity<Page<AcademicGroupResponse>> listPublicGroups(
            @RequestParam(required = false) Major major,
            @RequestParam(required = false) String search,
            Pageable pageable
    ) {
        Page<AcademicGroupResponse> page = groupService.listPublicGroups(
                major,
                search,
                pageable
        ).map(GroupMapper::toResponse);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/me")
    public ResponseEntity<Page<AcademicGroupResponse>> listMyGroups(
            @AuthenticationPrincipal SecurityUser currentUser,
            Pageable pageable
    ) {
        Page<AcademicGroupResponse> page = groupService.listMyGroups(currentUser.getProfileId(), pageable)
                .map(GroupMapper::toResponse);
        return ResponseEntity.ok(page);
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<GroupMembershipResponse> joinPublicGroup(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable UUID groupId
    ) {
        GroupMembership membership = groupService.joinGroup(groupId, currentUser.getProfileId());
        return ResponseEntity.status(201).body(GroupMapper.toResponse(membership));
    }

    @PostMapping("/{groupId}/request-join")
    public ResponseEntity<GroupMembershipResponse> requestJoinPrivateGroup(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable UUID groupId
    ) {
        GroupMembership membership = groupService.requestToJoinPrivateGroup(groupId, currentUser.getProfileId());
        return ResponseEntity.status(201).body(GroupMapper.toResponse(membership));
    }

    @DeleteMapping("/{groupId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable UUID groupId,
            @PathVariable UUID memberId
    ) {
        groupService.removeMember(groupId, currentUser.getProfileId(), memberId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupDetailResponse> getGroupById(
            @PathVariable UUID groupId
    ) {
        AcademicGroup group = groupService.getGroupById(groupId);
        return ResponseEntity.ok(GroupMapper.toDetailResponse(group));
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<Page<GroupMembershipResponse>> listGroupMembers(
            @PathVariable UUID groupId,
            Pageable pageable
    ) {
        Page<GroupMembershipResponse> page = groupService.listGroupMembers(groupId, pageable)
                .map(GroupMapper::toResponse);
        return ResponseEntity.ok(page);
    }
}