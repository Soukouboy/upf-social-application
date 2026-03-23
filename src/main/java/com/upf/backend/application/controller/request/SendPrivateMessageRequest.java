package com.upf.backend.application.controller.request;

import java.util.UUID;

public record SendPrivateMessageRequest(
        UUID recipientId,
        String content
) {
}