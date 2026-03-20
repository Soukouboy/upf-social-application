package com.upf.backend.application.services.Interfaces;


import com.upf.backend.application.model.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.UUID;

public interface IChatService {

    Message sendGroupMessage(UUID senderId, UUID groupId, String content);

    Page<Message> getGroupMessages(UUID groupId, Pageable pageable);

    Page<Message> getGroupMessagesBefore(UUID groupId,
                                         LocalDateTime before,
                                         Pageable pageable);

    Message sendPrivateMessage(UUID senderId, UUID recipientId, String content);

    Page<Message> getPrivateConversation(UUID userA,
                                         UUID userB,
                                         Pageable pageable);

}
