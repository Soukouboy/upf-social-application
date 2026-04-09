package com.upf.backend.application.mapper;

import com.upf.backend.application.dto.student.StudentProfileDetails;
import com.upf.backend.application.dto.student.StudentProfileResponse;
import com.upf.backend.application.dto.student.StudentProfileSummary;
import com.upf.backend.application.dto.student.StudentPublicProfileResponse;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.entity.User;

/**
 * Mappeur pour les DTOs StudentProfile.
 * Évite la récursion JSON en séparant les couches Entity ↔ DTO.
 */
public class StudentMapper {

    /**
     * Convertit une entité StudentProfile + User en StudentProfileResponse.
     * Utilisé pour les endpoints de détail.
     */
    public static StudentProfileResponse toResponse(StudentProfile studentProfile, User user) {
        if (studentProfile == null || user == null) {
            return null;
        }

        return new StudentProfileResponse(
            studentProfile.getId(),
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            studentProfile.getMajor(),
            studentProfile.getCurrentYear(),
            studentProfile.getProfilePictureUrl(),
            studentProfile.getBio(),
            studentProfile.isProfilePublic(),
            studentProfile.getLastLoginAt()
            ,user.getRole()
        );
    }

    /**
     * Convertit une entité StudentProfile en StudentProfileResponse.
     * La User est récupérée depuis studentProfile.getUser().
     */
    public static StudentProfileResponse toResponse(StudentProfile studentProfile) {
        if (studentProfile == null) {
            return null;
        }
        User user = studentProfile.getUser();
        return toResponse(studentProfile, user);
    }

    /**
     * Convertit une entité StudentProfile en StudentProfileSummary.
     * Utilisé pour les listes et relations imbriquées.
     */
    public static StudentProfileSummary toSummary(StudentProfile studentProfile) {
        if (studentProfile == null) {
            return null;
        }

        return new StudentProfileSummary(
            studentProfile.getId(),
            studentProfile.getUser().getFirstName(),
            studentProfile.getUser().getLastName(),
            studentProfile.getMajor(),
            studentProfile.getCurrentYear(),
            studentProfile.getProfilePictureUrl(),
            0 // followersCount will be set by service
        );
    }

    /**
     * Convertit une entité StudentProfile en StudentProfileSummary avec le nombre de followers.
     * Utilisé pour les listes et relations imbriquées.
     */
    public static StudentProfileSummary toSummaryWithFollowers(StudentProfile studentProfile, int followersCount) {
        if (studentProfile == null) {
            return null;
        }

        return new StudentProfileSummary(
            studentProfile.getId(),
            studentProfile.getUser().getFirstName(),
            studentProfile.getUser().getLastName(),
            studentProfile.getMajor(),
            studentProfile.getCurrentYear(),
            studentProfile.getProfilePictureUrl(),
            followersCount
        );
    }

    /**
     * Convertit une entité StudentProfile en StudentProfileDetails.
     * Inclut les métadonnées additionnelles (createdAt, etc.).
     */
    public static StudentProfileDetails toDetails(StudentProfile studentProfile, User user) {
        if (studentProfile == null || user == null) {
            return null;
        }

        return new StudentProfileDetails(
            studentProfile.getId(),
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            studentProfile.getMajor(),
            studentProfile.getCurrentYear(),
            studentProfile.getProfilePictureUrl(),
            studentProfile.getBio(),
            studentProfile.isProfilePublic(),
            studentProfile.getLastLoginAt(),
            user.getCreatedAt()
        );
    }

    /**
     * Convertit une entité StudentProfile en StudentProfileDetails.
     */
    public static StudentProfileDetails toDetails(StudentProfile studentProfile) {
        if (studentProfile == null) {
            return null;
        }
        User user = studentProfile.getUser();
        return toDetails(studentProfile, user);
    }

    /**
     * Convertit une entité StudentProfile en StudentPublicProfileResponse.
     * Utilisé pour consulter le profil public d'un autre étudiant.
     */
    public static StudentPublicProfileResponse toPublicResponse(StudentProfile studentProfile) {
        if (studentProfile == null) {
            return null;
        }

        return new StudentPublicProfileResponse(
            studentProfile.getId(),
            studentProfile.getUser().getFirstName(),
            studentProfile.getUser().getLastName(),
            studentProfile.getMajor(),
            studentProfile.getCurrentYear(),
            studentProfile.getProfilePictureUrl(),
            studentProfile.getBio(),
            studentProfile.getLastLoginAt()
        );
    }
}
