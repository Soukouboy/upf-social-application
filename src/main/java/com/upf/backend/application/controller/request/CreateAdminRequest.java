package com.upf.backend.application.controller.request;

import com.upf.backend.application.model.enums.AdminLevel;

public record CreateAdminRequest(
        String firstName,
        String lastName,
        String email,
        String password,
        AdminLevel adminLevel
) {
}