package com.upf.backend.application.controller;

import com.upf.backend.application.controller.request.UpdateProfilRequest;
import com.upf.backend.application.dto.CurrentUserProfileResponse;
import com.upf.backend.application.dto.admin.AdminProfileResponse;
import com.upf.backend.application.dto.professor.ProfessorProfileResponse;
import com.upf.backend.application.dto.student.StudentProfileResponse;
import com.upf.backend.application.dto.student.StudentProfileSummary;
import com.upf.backend.application.mapper.AdminMapper;
import com.upf.backend.application.mapper.ProfessorMapper;
import com.upf.backend.application.mapper.StudentMapper;
import com.upf.backend.application.model.entity.AdminProfile;
import com.upf.backend.application.model.entity.ProfessorProfile;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.enums.UserRole;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.Interfaces.IAdminService;
import com.upf.backend.application.services.Interfaces.IProfessorService;
import com.upf.backend.application.services.Interfaces.IUserService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final IUserService userService;
    private final IAdminService adminService;
    private final IProfessorService professorService;

    public UserController(IUserService userService,
                          IAdminService adminService,
                          IProfessorService professorService) {
        this.userService = userService;
        this.adminService = adminService;
        this.professorService = professorService;
    }

    @GetMapping("/me")
    public ResponseEntity<CurrentUserProfileResponse> getCurrentUserProfile(
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        UserRole role = currentUser.getRole();
        CurrentUserProfileResponse response = switch (role) {
            case STUDENT -> new CurrentUserProfileResponse(
                    role,
                    StudentMapper.toResponse(userService.getCurrentUserProfile(currentUser.getProfileId())),
                    null,
                    null
            );
            case ADMIN -> new CurrentUserProfileResponse(
                    role,
                    null,
                    AdminMapper.toResponse(adminService.getAdminProfile(currentUser.getProfileId())),
                    null
            );
            case PROFESSOR -> new CurrentUserProfileResponse(
                    role,
                    null,
                    null,
                    ProfessorMapper.toResponse(professorService.getProfessorProfile(currentUser.getProfileId()))
            );
        };

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<StudentProfileResponse> updateMyProfile(
            @AuthenticationPrincipal SecurityUser currentUser,
            @RequestBody UpdateProfilRequest request
    ) {
        StudentProfile updated = userService.updateProfile(
                currentUser.getProfileId(),
                request.bio(),
                request.profilePhotoUrl(),
                request.major(),
                request.currentYear(),
                request.profilePublic()
        );
        return ResponseEntity.ok(StudentMapper.toResponse(updated));
    }

    @GetMapping
    public ResponseEntity<List<StudentProfileSummary>> getAllStudents() {
        List<StudentProfileSummary> responses = userService.getAllStudents();
        if (responses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(responses);
    }
}