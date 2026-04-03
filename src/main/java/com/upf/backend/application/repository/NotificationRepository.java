package com.upf.backend.application.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.upf.backend.application.model.entity.Notification;
import com.upf.backend.application.model.enums.NotificationStatus;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {




    // ✅ recipient et non user
    List<Notification> findByRecipient_IdOrderByCreatedAtDesc(UUID recipientId);

    // ✅ isRead et non status
    List<Notification> findByRecipient_IdAndIsReadFalse(UUID recipientId);

    // ✅ count non lues
    long countByRecipient_IdAndIsReadFalse(UUID recipientId);

    // ✅ notifications en échec (status FAILED)
    List<Notification> findByStatus(NotificationStatus status);
}


