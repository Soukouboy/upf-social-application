package com.upf.backend.application.dto;

import java.util.UUID;

// Message entrant (frontend → backend)
public record ChatMessageRequest(
    String content,
    UUID groupId      // null si message privé
) {}

// Message sortant (backend → frontend)

