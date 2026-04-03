package com.upf.backend.application.dto;

import java.util.UUID;

// Notification temps réel
public record WsNotification(
    String type,      // "NEW_MESSAGE", "NEW_ANNOUNCEMENT", "NEW_FOLLOWER"
    String title,
    String body,
    UUID relatedId    // courseId, groupId, userId selon le type
) {}