package com.upf.backend.application.dto;

import com.upf.backend.application.dto.admin.AdminProfileResponse;
import com.upf.backend.application.dto.professor.ProfessorProfileResponse;
import com.upf.backend.application.dto.student.StudentProfileResponse;
import com.upf.backend.application.model.enums.UserRole;

/**
 * DTO générique renvoyé par GET /users/me.
 * Un seul bloc de profil est rempli selon le rôle connecté.
 */
public record CurrentUserProfileResponse(
        UserRole role,
        StudentProfileResponse studentProfile,
        AdminProfileResponse adminProfile,
        ProfessorProfileResponse professorProfile
) {}
