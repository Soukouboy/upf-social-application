package com.upf.backend.application.mapper;

import com.upf.backend.application.dto.ChatMessageResponse;
import com.upf.backend.application.model.entity.Messages;
import com.upf.backend.application.model.entity.StudentProfile;

public class ChatMapper {

    public static ChatMessageResponse toResponse(Messages message) {
        if (message == null) {
            return null;
        }

        String senderName = getSenderName(message);

        return new ChatMessageResponse(
                message.getId(),
                message.getContent(),
                senderName,
                message.getSenderId(),
                message.getGroup() != null ? message.getGroup().getId() : null,
                message.getRecipientId(),
                message.getMessageType(),
                message.getEditedAt(),
                message.getCreatedAt()
        );
    }

  
    private static String getSenderName(Messages message) {
        // Note: Pour accéder au nom du sender, il faudrait une requête séparée ou une association
        // Pour l'instant, on retourne null. À améliorer si StudentProfile est disponible directement.
        return null;
    }
}
