package com.upf.backend.application.dto.group;

import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.RoleMember;

public record GroupMembershipResponse(
        UUID id,
        UUID groupId,
        UUID studentProfileId,
        String firstName,
        String lastName,
        RoleMember role,
        LocalDateTime joinedAt,
        LocalDateTime lastReadAt
) {}
