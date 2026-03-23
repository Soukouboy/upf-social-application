package com.upf.backend.application.controller.request;

public record RegisterStudentRequest(
        String email,
        String password,
        String major,
        int currentYear
) {
}