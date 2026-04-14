package com.upf.backend.application.dto.group;
import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.GroupType;
import com.upf.backend.application.model.enums.Major;

public record AcademicGroupResponse(
        UUID id,
        String name,
        String description,
        String coverImageUrl,
        GroupType type,
        Major major,
        UUID createdBy,
        int memberCount,
        int messageCount,
        boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
