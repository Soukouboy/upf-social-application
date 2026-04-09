package com.upf.backend.application.controller;

import com.upf.backend.application.dto.student.StudentStatsResponse;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.Interfaces.IUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/students")
public class StudentController {

    private final IUserService userService;

    public StudentController(IUserService userService) {
        this.userService = userService;
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me/stats")
    public ResponseEntity<StudentStatsResponse> getMyStats(
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        StudentStatsResponse stats = userService.getStudentStats(currentUser.getProfileId());
        return ResponseEntity.ok(stats);
    }
}