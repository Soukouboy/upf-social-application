package com.upf.backend.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.MessageType;

public record ChatMessageResponse(
        UUID messageId,
        String content,
        String senderName,
        UUID senderId,
        UUID groupId,
        UUID recipientId,
        MessageType messageType,
        LocalDateTime editedAt,
        LocalDateTime sentAt
) {}