package com.upf.backend.application.repository;

import com.upf.backend.application.model.entity.Message;
import com.upf.backend.application.model.enums.ContextMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    Page<Message> findByGroup_IdOrderByCreatedAtDesc(UUID groupId, Pageable pageable);

    Page<Message> findByGroup_IdAndCreatedAtLessThanOrderByCreatedAtDesc(
            UUID groupId,
            LocalDateTime before,
            Pageable pageable
    );

    @Query("""
           select m
           from Message m
           where m.context = :context
             and (
                   (m.senderId = :userA and m.recipientId = :userB)
                   or
                   (m.senderId = :userB and m.recipientId = :userA)
                 )
           order by m.createdAt desc
           """)
    Page<Message> findPrivateConversation(
            @Param("userA") UUID userA,
            @Param("userB") UUID userB,
            @Param("context") ContextMessage context,
            Pageable pageable
    );

    @Query("""
           select m
           from Message m
           where m.context = :context
             and (
                   (m.senderId = :userA and m.recipientId = :userB)
                   or
                   (m.senderId = :userB and m.recipientId = :userA)
                 )
             and m.createdAt < :before
           order by m.createdAt desc
           """)
    Page<Message> findPrivateConversationBefore(
            @Param("userA") UUID userA,
            @Param("userB") UUID userB,
            @Param("context") ContextMessage context,
            @Param("before") LocalDateTime before,
            Pageable pageable
    );
}