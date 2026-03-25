package com.upf.backend.application.controller.request;

public record RegisterStudentRequest(
        String firstName,
        String lastName,
        String email,
        String password,
        String major,
        int currentYear
) {
}