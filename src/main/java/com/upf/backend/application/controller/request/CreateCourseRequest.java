package com.upf.backend.application.controller.request;

public record CreateCourseRequest(
        String code,
        String title,
        String description,
        String objectives,
        String prerequisites,
        String major,
        Integer year,
        Integer semester,
        Integer credits,
        String instructorName
) {
}