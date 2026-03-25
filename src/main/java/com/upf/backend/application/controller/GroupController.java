package com.upf.backend.application.controller;

import com.upf.backend.application.controller.request.CreateGroupRequest;
import com.upf.backend.application.model.entity.AcademicGroup;
import com.upf.backend.application.model.entity.GroupMembership;
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
    public ResponseEntity<AcademicGroup> createGroup(
             @AuthenticationPrincipal SecurityUser currentUser,
            @RequestBody CreateGroupRequest request
    ) {
        AcademicGroup created = groupService.createGroup(
                currentUser.getProfileId(),
                request.name(),
                request.description(),
                request.type(),
                request.major(),
                request.coverImageUrl()
        );
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping("/public")
    public ResponseEntity<Page<AcademicGroup>> listPublicGroups(
            @RequestParam(required = false) String major,
            @RequestParam(required = false) String search,
            Pageable pageable
    ) {
        Page<AcademicGroup> page = groupService.listPublicGroups(
                major,
                search,
                pageable
        );
        return ResponseEntity.ok(page);
    }

    @GetMapping("/me")
    public ResponseEntity<Page<AcademicGroup>> listMyGroups(
            @AuthenticationPrincipal SecurityUser currentUser,
            Pageable pageable
    ) {
        Page<AcademicGroup> page = groupService.listMyGroups(currentUser.getProfileId(), pageable);
        return ResponseEntity.ok(page);
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<GroupMembership> joinPublicGroup(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable UUID groupId
    ) {
        GroupMembership membership = groupService.joinGroup(groupId, currentUser.getProfileId());
        return ResponseEntity.status(201).body(membership);
    }

    @PostMapping("/{groupId}/request-join")
    public ResponseEntity<GroupMembership> requestJoinPrivateGroup(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable UUID groupId
    ) {
        GroupMembership membership = groupService.requestToJoinPrivateGroup(groupId, currentUser.getProfileId());
        return ResponseEntity.status(201).body(membership);
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
}