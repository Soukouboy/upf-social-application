package com.upf.backend.application.dto.group;

import com.upf.backend.application.model.enums.GroupType;

import java.time.LocalDateTime;
import java.util.UUID;

public record AcademicGroupResponse(
        UUID id,
        String name,
        String description,
        String coverImageUrl,
        GroupType type,
        String major,
        UUID createdBy,
        int memberCount,
        int messageCount,
        boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
