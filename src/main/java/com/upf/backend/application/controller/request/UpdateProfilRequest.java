package com.upf.backend.application.controller.request;

public record UpdateProfilRequest(
        String bio,
        String profilePhotoUrl,
        String major,
        Integer currentYear,
        Boolean profilePublic
) {
}