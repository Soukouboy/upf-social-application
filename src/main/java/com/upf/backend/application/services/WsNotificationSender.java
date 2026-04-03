package com.upf.backend.application.services;

import java.util.UUID;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.upf.backend.application.dto.WsNotification;

@Service
public class WsNotificationSender {

    private final SimpMessagingTemplate messagingTemplate;

    public WsNotificationSender(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Notifie un utilisateur précis en temps réel
     * Le frontend écoute : /user/queue/notifications
     */
    public void notify(String userEmail, WsNotification notification) {
        messagingTemplate.convertAndSendToUser(
                userEmail,
                "/queue/notifications",
                notification
        );
    }

    /**
     * Broadcast à tous les abonnés d'un cours
     * Le frontend écoute : /topic/course/{courseId}
     */
    public void notifyCourse(UUID courseId, WsNotification notification) {
        messagingTemplate.convertAndSend(
                "/topic/course/" + courseId, notification);
    }
}