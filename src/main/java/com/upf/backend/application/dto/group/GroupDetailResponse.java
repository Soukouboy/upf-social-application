package com.upf.backend.application.dto.group;

import com.upf.backend.application.model.enums.GroupType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record GroupDetailResponse(
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
        LocalDateTime updatedAt,
        List<GroupMessageResponse> messages
) {}
