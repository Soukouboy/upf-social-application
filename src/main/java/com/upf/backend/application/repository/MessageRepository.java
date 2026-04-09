package com.upf.backend.application.repository;

import com.upf.backend.application.dto.PrivateConversationSummaryProjection;
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
        SELECT t.other_user_id AS otherUserId,
               MAX(t.created_at) AS lastMessageAt
        FROM (
            SELECT CASE WHEN sender_id = :userId THEN recipient_id ELSE sender_id END AS other_user_id,
                   created_at
            FROM messages
            WHERE is_deleted = false
              AND context = 'PRIVATE'
              AND (sender_id = :userId OR recipient_id = :userId)
        ) t
        GROUP BY t.other_user_id
        ORDER BY MAX(t.created_at) DESC
    """,
    countQuery = """
        SELECT COUNT(*)
        FROM (
            SELECT DISTINCT CASE WHEN sender_id = :userId THEN recipient_id ELSE sender_id END AS other_user_id
            FROM messages
            WHERE is_deleted = false
              AND context = 'PRIVATE'
              AND (sender_id = :userId OR recipient_id = :userId)
        ) t
    """,
    nativeQuery = true)
    Page<PrivateConversationSummaryProjection> findPrivateConversationSummaries(
            @Param("userId") UUID userId,
            Pageable pageable);
}