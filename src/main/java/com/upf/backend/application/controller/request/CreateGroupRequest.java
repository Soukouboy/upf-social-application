package com.upf.backend.application.controller.request;

import com.upf.backend.application.model.enums.GroupType;

public record CreateGroupRequest(
        String name,
        String description,
        GroupType type,
        String major
) {
}