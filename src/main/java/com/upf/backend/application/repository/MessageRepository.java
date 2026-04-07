package com.upf.backend.application.repository;

import com.upf.backend.application.dto.PrivateConversationSummaryResponse;
import com.upf.backend.application.model.entity.Messages;
import com.upf.backend.application.model.enums.ContextMessage;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Messages, UUID> {

    // ✅ group est une relation → group_Id
    Page<Messages> findByGroup_IdAndIsDeletedFalseOrderByCreatedAtAsc(UUID groupId, Pageable pageable);

    // ✅ senderId et recipientId sont des UUID bruts → pas de underscore
    Page<Messages> findBySenderIdAndRecipientIdAndIsDeletedFalseOrderByCreatedAtAsc(
            UUID senderId, UUID recipientId, Pageable pageable);

    // Conversation privée dans les deux sens
    // (A→B et B→A dans la même conversation)
    @Query("""
        SELECT m FROM Messages m
        WHERE m.isDeleted = false
        AND (
            (m.senderId = :userA AND m.recipientId = :userB)
            OR
            (m.senderId = :userB AND m.recipientId = :userA)
        )
        ORDER BY m.createdAt ASC
    """)
    Page<Messages> findPrivateConversation(
            @Param("userA") UUID userA,
            @Param("userB") UUID userB,
            Pageable pageable);

    @Query(value = """
        SELECT new com.upf.backend.application.dto.PrivateConversationSummaryResponse(
            CASE WHEN m.senderId = :userId THEN m.recipientId ELSE m.senderId END,
            MAX(m.createdAt)
        )
        FROM Messages m
        WHERE m.isDeleted = false
          AND m.context = com.upf.backend.application.model.enums.ContextMessage.PRIVATE
          AND (m.senderId = :userId OR m.recipientId = :userId)
        GROUP BY CASE WHEN m.senderId = :userId THEN m.recipientId ELSE m.senderId END
        ORDER BY MAX(m.createdAt) DESC
    """,
    countQuery = """
        SELECT COUNT(DISTINCT CASE WHEN m.senderId = :userId THEN m.recipientId ELSE m.senderId END)
        FROM Messages m
        WHERE m.isDeleted = false
          AND m.context = com.upf.backend.application.model.enums.ContextMessage.PRIVATE
          AND (m.senderId = :userId OR m.recipientId = :userId)
    """)
    Page<PrivateConversationSummaryResponse> findPrivateConversationSummaries(
            @Param("userId") UUID userId,
            Pageable pageable);
}