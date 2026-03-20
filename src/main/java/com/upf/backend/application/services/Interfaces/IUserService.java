package com.upf.backend.application.services.Interfaces;

import com.upf.backend.application.model.entity.StudentProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;
public interface IUserService {


StudentProfile getCurrentUserProfile(UUID studentId);

    StudentProfile updateProfile(UUID studentId,
                                 String bio,
                                 String profilePhotoUrl,
                                 String major,
                                 Integer currentYear,
                                 Boolean profilePublic);

    Optional<StudentProfile> getPublicProfile(UUID studentId);

    Page<StudentProfile> searchPublicProfiles(String major,
                                              Integer currentYear,
                                              Pageable pageable);


}
