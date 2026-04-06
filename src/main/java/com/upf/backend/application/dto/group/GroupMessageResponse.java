package com.upf.backend.application.dto.group;

import com.upf.backend.application.model.enums.MessageType;

import java.time.LocalDateTime;
import java.util.UUID;

public record GroupMessageResponse(
        UUID id,
        String content,
        UUID senderId,
        MessageType messageType,
        String fileUrl,
        String fileName,
        Long fileSize,
        UUID replyToId,
        boolean isEdited,
        LocalDateTime editedAt,
        LocalDateTime createdAt
) {}
