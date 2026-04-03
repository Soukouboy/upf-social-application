package com.upf.backend.application.controller;

import com.upf.backend.application.controller.request.SendMessageRequest;
import com.upf.backend.application.controller.request.SendPrivateMessageRequest;
import com.upf.backend.application.model.entity.Messages;
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
    public ResponseEntity<Messages> sendGroupMessage(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable UUID groupId,
            @RequestBody SendMessageRequest request
    ) {
        Messages created = chatService.sendGroupMessage(currentUser.getProfileId(), groupId, request.content());
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping("/groups/{groupId}")
    public ResponseEntity<Page<Messages>> getGroupMessages(
            @PathVariable UUID groupId,
            Pageable pageable
    ) {
        Page<Messages> page = chatService.getGroupMessages(groupId, pageable);
        return ResponseEntity.ok(page);
    }

    // @GetMapping("/groups/{groupId}/before")
    // public ResponseEntity<Page<Messages>> getGroupMessagesBefore(
    //         @PathVariable UUID groupId,
    //         @RequestParam
    //         @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    //         LocalDateTime before,
    //         Pageable pageable
    // ) {
    //     Page<Messages> page = chatService.getGroupMessagesBefore(groupId, before, pageable);
    //     return ResponseEntity.ok(page);
    // }

    @PostMapping("/private")
    public ResponseEntity<Messages> sendPrivateMessage(
            @AuthenticationPrincipal SecurityUser currentUser,
            @RequestBody SendPrivateMessageRequest request
    ) {
        Messages  created = chatService.sendPrivateMessage(
                currentUser.getProfileId(),
                request.recipientId(),
                request.content()
        );
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping("/private")
    public ResponseEntity<Page<Messages>> getPrivateConversation(
            @AuthenticationPrincipal SecurityUser currentUser,
            @RequestParam UUID otherUserId,
            Pageable pageable
    ) {
        Page<Messages> page = chatService.getPrivateConversation(
                currentUser.getProfileId(),
                otherUserId,
                pageable
        );
        return ResponseEntity.ok(page);
    }
}