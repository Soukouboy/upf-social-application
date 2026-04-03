package com.upf.backend.application.mapper;

import com.upf.backend.application.dto.admin.AdminProfileResponse;
import com.upf.backend.application.dto.admin.AdminProfileSummary;
import com.upf.backend.application.model.entity.AdminProfile;
import com.upf.backend.application.model.entity.User;

/**
 * Mappeur pour les DTOs AdminProfile.
 */
public class AdminMapper {

    /**
     * Convertit une entité AdminProfile en AdminProfileResponse.
     */
    public static AdminProfileResponse toResponse(AdminProfile adminProfile) {
        if (adminProfile == null) {
            return null;
        }

        User user = adminProfile.getUser();
        if (user == null) {
            return null;
        }

        return new AdminProfileResponse(
            adminProfile.getId(),
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            adminProfile.getAdminLevel(),
            adminProfile.getLastActionAt()
        );
    }

    /**
     * Convertit une entité AdminProfile en AdminProfileSummary.
     */
    public static AdminProfileSummary toSummary(AdminProfile adminProfile) {
        if (adminProfile == null) {
            return null;
        }

        return new AdminProfileSummary(
            adminProfile.getId(),
            adminProfile.getUser().getFirstName(),
            adminProfile.getUser().getLastName(),
            adminProfile.getAdminLevel()
        );
    }
}
