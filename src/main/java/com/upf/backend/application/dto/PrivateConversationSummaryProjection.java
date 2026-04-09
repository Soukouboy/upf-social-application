package com.upf.backend.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public interface PrivateConversationSummaryProjection {
    UUID getOtherUserId();
    LocalDateTime getLastMessageAt();
}
