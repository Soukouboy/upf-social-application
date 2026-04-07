package com.upf.backend.application.services.Interfaces;


import com.upf.backend.application.dto.PrivateConversationSummaryResponse;
import com.upf.backend.application.model.entity.Messages;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.UUID;

public interface IChatService {

    Messages sendGroupMessage(UUID senderId, UUID groupId, String content);

    Page<Messages> getGroupMessages(UUID groupId, Pageable pageable);

    // Page<Messages> getGroupMessagesBefore(UUID groupId,
    //                                      LocalDateTime before,
    //                                      Pageable pageable);

    Messages sendPrivateMessage(UUID senderId, UUID recipientId, String content);

    Page<Messages> getPrivateConversation(UUID userA,
                                         UUID userB,
                                         Pageable pageable);

    Page<PrivateConversationSummaryResponse> listPrivateConversations(UUID userId, Pageable pageable);

}
