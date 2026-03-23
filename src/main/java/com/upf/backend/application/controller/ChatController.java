package com.upf.backend.application.controller;

import com.upf.backend.application.controller.request.SendMessageRequest;
import com.upf.backend.application.controller.request.SendPrivateMessageRequest;
import com.upf.backend.application.model.entity.Message;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.ChatService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/messages")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/groups/{groupId}")
    public ResponseEntity<Message> sendGroupMessage(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable UUID groupId,
            @RequestBody SendMessageRequest request
    ) {
        Message created = chatService.sendGroupMessage(currentUser.getStudentId(), groupId, request.content());
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping("/groups/{groupId}")
    public ResponseEntity<Page<Message>> getGroupMessages(
            @PathVariable UUID groupId,
            Pageable pageable
    ) {
        Page<Message> page = chatService.getGroupMessages(groupId, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/groups/{groupId}/before")
    public ResponseEntity<Page<Message>> getGroupMessagesBefore(
            @PathVariable UUID groupId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime before,
            Pageable pageable
    ) {
        Page<Message> page = chatService.getGroupMessagesBefore(groupId, before, pageable);
        return ResponseEntity.ok(page);
    }

    @PostMapping("/private")
    public ResponseEntity<Message> sendPrivateMessage(
            @AuthenticationPrincipal SecurityUser currentUser,
            @RequestBody SendPrivateMessageRequest request
    ) {
        Message created = chatService.sendPrivateMessage(
                currentUser.getStudentId(),
                request.recipientId(),
                request.content()
        );
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping("/private")
    public ResponseEntity<Page<Message>> getPrivateConversation(
            @AuthenticationPrincipal SecurityUser currentUser,
            @RequestParam UUID otherUserId,
            Pageable pageable
    ) {
        Page<Message> page = chatService.getPrivateConversation(
                currentUser.getStudentId(),
                otherUserId,
                pageable
        );
        return ResponseEntity.ok(page);
    }
}