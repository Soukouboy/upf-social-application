package com.upf.backend.application.dto.student;

public record StudentStatsResponse(
    int enrolledCoursesCount,
    int uploadedExamsCount,
    int myGroupsCount,
    int totalDownloadsReceived
) {}