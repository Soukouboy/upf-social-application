package com.upf.backend.application.services.Interfaces;

import com.upf.backend.application.dto.student.StudentProfileSummary;
import com.upf.backend.application.dto.student.StudentPublicProfileResponse;
import com.upf.backend.application.dto.student.StudentStatsResponse;
import com.upf.backend.application.dto.student.StudentStatsResponse;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.enums.Major;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
public interface IUserService {


StudentProfile getCurrentUserProfile(UUID studentId);

    StudentProfile updateProfile(UUID studentId,
                                 String bio,
                                 String profilePhotoUrl,
                                 String storagePath,
                                 Major major,
                                 Integer currentYear,
                                 Boolean profilePublic);

    Optional<StudentProfile> getPublicProfile(UUID studentId);

    Optional<StudentPublicProfileResponse> getPublicProfileResponse(UUID studentId);

    /**
     * Récupère les informations publiques d'un étudiant par son ID.
     * N'expose pas email et password.
     * Contrairement à getPublicProfile, cela ne filtre pas sur isProfilePublic.
     * 
     * @param studentId UUID de l'étudiant
     * @return StudentPublicProfileResponse ou Optional.empty() si non trouvé
     */
    Optional<StudentPublicProfileResponse> getStudentPublicInfo(UUID studentId);

    Page<StudentProfile> searchPublicProfiles(String major,
                                              Integer currentYear,
                                              Pageable pageable);

    List<StudentProfileSummary> getAllStudents();

    StudentStatsResponse getStudentStats(UUID studentId);


}
