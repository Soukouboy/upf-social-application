package com.upf.backend.application.dto;

<<<<<<< HEAD
import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.MessageType;

=======
import com.upf.backend.application.model.enums.MessageType;

import java.time.LocalDateTime;
import java.util.UUID;

>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164
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