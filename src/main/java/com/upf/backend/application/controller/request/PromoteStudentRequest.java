package com.upf.backend.application.controller.request;

import com.upf.backend.application.model.enums.AdminLevel;

public record PromoteStudentRequest(
        AdminLevel adminLevel
) {
}