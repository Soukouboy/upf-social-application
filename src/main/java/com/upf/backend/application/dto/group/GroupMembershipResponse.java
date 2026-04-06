package com.upf.backend.application.dto.group;

import com.upf.backend.application.model.enums.RoleMember;

import java.time.LocalDateTime;
import java.util.UUID;

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
