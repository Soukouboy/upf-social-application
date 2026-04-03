package com.upf.backend.application.controller;

import java.security.Principal;
import java.util.UUID;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.upf.backend.application.dto.ChatMessageRequest;
import com.upf.backend.application.dto.ChatMessageResponse;
import com.upf.backend.application.model.entity.Messages;
import com.upf.backend.application.model.entity.User;
import com.upf.backend.application.repository.UserRepository;
import com.upf.backend.application.services.ChatService;

@Controller
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService messageService;
    private final UserRepository userRepository;

    public WebSocketController(SimpMessagingTemplate messagingTemplate,
                                ChatService messageService,
                                UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.messageService    = messageService;
        this.userRepository    = userRepository;
    }

    // ─── Message de groupe ────────────────────────────────────────────────────

    /**
     * Frontend envoie vers : /app/chat/group/{groupId}
     * Tous les abonnés de /topic/group/{groupId} reçoivent
     */
    @MessageMapping("/chat/group/{groupId}")
    public void sendGroupMessage(@DestinationVariable UUID groupId,
                                  @Payload ChatMessageRequest request,
                                  Principal principal) {

        User sender = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable."));

        // ✅ Persister le message en BDD
        Messages saved = messageService.sendGroupMessage(
                sender.getId(), groupId, request.content());

        ChatMessageResponse response = new ChatMessageResponse(
                saved.getId(),
                saved.getContent(),
                sender.getFirstName() + " " + sender.getLastName(),
                sender.getId(),
                groupId,
                saved.getCreatedAt()
        );

        // ✅ Broadcaster à tous les membres du groupe
        messagingTemplate.convertAndSend(
                "/topic/group/" + groupId, response);
    }

    // ─── Message privé ────────────────────────────────────────────────────────

    /**
     * Frontend envoie vers : /app/chat/private/{recipientId}
     * Seul /user/{recipientEmail}/queue/messages reçoit
     */
    @MessageMapping("/chat/private/{recipientId}")
    public void sendPrivateMessage(@DestinationVariable UUID recipientId,
                                    @Payload ChatMessageRequest request,
                                    Principal principal) {

        User sender    = userRepository.findByEmail(principal.getName())
                .orElseThrow();
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Destinataire introuvable."));

        // ✅ Persister
        Messages saved = messageService.sendPrivateMessage(
                sender.getId(), recipientId, request.content());

        ChatMessageResponse response = new ChatMessageResponse(
                saved.getId(),
                saved.getContent(),
                sender.getFirstName() + " " + sender.getLastName(),
                sender.getId(),
                null,
                saved.getCreatedAt()
        );

        // ✅ Envoyer uniquement au destinataire
        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                "/queue/messages",
                response
        );

        // ✅ Echo à l'expéditeur aussi (pour qu'il voie son propre message)
        messagingTemplate.convertAndSendToUser(
                sender.getEmail(),
                "/queue/messages",
                response
        );
    }
}