package com.upf.backend.application.services;
import com.upf.backend.application.services.Exceptions.*;
import com.upf.backend.application.services.Interfaces.IUserService;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserServiceImpl implements IUserService {

    private final StudentRepository studentRepository;

    public UserServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public StudentProfile getCurrentUserProfile(UUID studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil étudiant introuvable."));
    }

    @Override
    public StudentProfile updateProfile(UUID studentId,
                                        String bio,
                                        String profilePhotoUrl,
                                        String major,
                                        Integer currentYear,
                                        Boolean profilePublic) {
        StudentProfile profile = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil étudiant introuvable."));

        if (bio != null) {
            profile.setBio(bio);
        }
        if (profilePhotoUrl != null) {
            profile.setProfilePictureUrl(profilePhotoUrl);
        }
        if (major != null && !major.isBlank()) {
            profile.setMajor(major);
        }
        if (currentYear != null) {
            profile.setCurrentYear(currentYear);
        }
        if (profilePublic != null) {
            profile.setProfilePublic(profilePublic);
        }

        return studentRepository.save(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<StudentProfile> getPublicProfile(UUID studentId) {
        return studentRepository.findById(studentId)
                .filter(StudentProfile::isProfilePublic);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentProfile> searchPublicProfiles(String major,
                                                     Integer currentYear,
                                                     Pageable pageable) {
        if (major != null && currentYear != null) {
            return studentRepository.findByMajorAndCurrentYearAndIsProfilePublicTrue(major, currentYear, pageable);
        }

        if (major != null) {
            return studentRepository.findByMajorAndIsProfilePublicTrue(major, pageable);
        }

        if (currentYear != null) {
            return studentRepository.findByCurrentYearAndIsProfilePublicTrue(currentYear, pageable);
        }

        return studentRepository.findByIsProfilePublicTrue(pageable);
    }
}