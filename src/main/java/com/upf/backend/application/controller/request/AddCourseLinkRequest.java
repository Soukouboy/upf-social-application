package com.upf.backend.application.controller.request;

public record AddCourseLinkRequest(
        String title,
        String description,
        String externalUrl
) {
}