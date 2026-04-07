package com.upf.backend.application.dto.group;

<<<<<<< HEAD
import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.MessageType;

=======
import com.upf.backend.application.model.enums.MessageType;

import java.time.LocalDateTime;
import java.util.UUID;

>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164
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
