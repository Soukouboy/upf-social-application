package com.upf.backend.application.controller.request;

public record LoginRequest(
        String email,
        String password
) {
}