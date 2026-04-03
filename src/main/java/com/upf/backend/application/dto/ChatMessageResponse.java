package com.upf.backend.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ChatMessageResponse(
    UUID messageId,
    String content,
    String senderName,
    UUID senderId,
    UUID groupId,
    LocalDateTime sentAt
) {}