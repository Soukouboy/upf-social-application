package com.upf.backend.application.controller.request;

public record CreateCourseRequest(
        String code,
        String title,
        String description,
        String major,   
        Integer semester,
        Integer credits
) {
}