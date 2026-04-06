package com.upf.backend.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record PrivateConversationSummaryResponse(
        UUID otherUserId,
        LocalDateTime lastMessageAt
) {}
