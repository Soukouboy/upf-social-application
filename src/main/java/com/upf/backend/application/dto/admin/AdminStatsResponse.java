package com.upf.backend.application.dto.admin;

public record AdminStatsResponse(
    int totalUsers,
    int activeUsers,
    int totalStudents,
    int totalProfessors,
    int totalCourses,
    int totalExams,
    int totalGroups,
    int pendingReports
) {}