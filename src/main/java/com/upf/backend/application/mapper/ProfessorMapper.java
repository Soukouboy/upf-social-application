package com.upf.backend.application.mapper;

import com.upf.backend.application.dto.professor.ProfessorProfileResponse;
import com.upf.backend.application.dto.professor.ProfessorProfileSummary;
import com.upf.backend.application.model.entity.ProfessorProfile;
import com.upf.backend.application.model.entity.User;

/**
 * Mappeur pour les DTOs ProfessorProfile.
 */
public class ProfessorMapper {

    /**
     * Convertit une entité ProfessorProfile en ProfessorProfileResponse.
     */
    public static ProfessorProfileResponse toResponse(ProfessorProfile professorProfile) {
        if (professorProfile == null) {
            return null;
        }

        User user = professorProfile.getUser();
        if (user == null) {
            return null;
        }

        return new ProfessorProfileResponse(
            professorProfile.getId(),
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            professorProfile.getDepartment(),
            professorProfile.getTitle(),
            professorProfile.getBio()
        );
    }

    /**
     * Convertit une entité ProfessorProfile en ProfessorProfileSummary.
     */
    public static ProfessorProfileSummary toSummary(ProfessorProfile professorProfile) {
        if (professorProfile == null) {
            return null;
        }

        return new ProfessorProfileSummary(
            professorProfile.getId(),
            professorProfile.getUser().getFirstName(),
            professorProfile.getUser().getLastName(),
            professorProfile.getDepartment(),
            professorProfile.getTitle()
        );
    }
}
