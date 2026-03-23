package com.upf.backend.application.services.Interfaces;

import com.upf.backend.application.model.entity.AdminProfile;
import com.upf.backend.application.model.enums.AdminLevel;

import java.util.List;
import java.util.UUID;

public interface IAdminService {

    AdminProfile bootstrapInitialAdmin(String email,
                                       String rawPassword,
                                       AdminLevel adminLevel);

    AdminProfile createAdminAccount(String email,
                                    String rawPassword,
                                    AdminLevel adminLevel);

    AdminProfile promoteStudentToAdmin(UUID studentId,
                                       AdminLevel adminLevel);

    List<AdminProfile> listAdmins();

    AdminProfile getAdminProfile(UUID adminProfileId);

    AdminProfile updateAdminLevel(UUID adminProfileId,
                                  AdminLevel adminLevel);

    void revokeAdminRights(UUID adminProfileId);
}