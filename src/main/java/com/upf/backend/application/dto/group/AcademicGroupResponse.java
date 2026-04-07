package com.upf.backend.application.dto.group;

<<<<<<< HEAD
import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.GroupType;

=======
import com.upf.backend.application.model.enums.GroupType;

import java.time.LocalDateTime;
import java.util.UUID;

>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164
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
