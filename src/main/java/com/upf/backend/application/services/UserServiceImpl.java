package com.upf.backend.application.services;
import com.upf.backend.application.services.Exceptions.*;
import com.upf.backend.application.services.Interfaces.IUserService;
import com.upf.backend.application.dto.student.StudentProfileSummary;
import com.upf.backend.application.dto.student.StudentPublicProfileResponse;
import com.upf.backend.application.dto.student.StudentStatsResponse;
import com.upf.backend.application.mapper.StudentMapper;
import com.upf.backend.application.model.entity.AcademicGroup;
import com.upf.backend.application.model.entity.Enrollment;
import com.upf.backend.application.model.entity.Exam;
import com.upf.backend.application.model.entity.GroupMembership;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.enums.EnrollmentStatus;
import com.upf.backend.application.model.enums.Major;
import com.upf.backend.application.model.enums.MembershipStatus;
import com.upf.backend.application.repository.AcademicGroupRepository;
import com.upf.backend.application.repository.EnrollmentRepository;
import com.upf.backend.application.repository.ExamRepository;
import com.upf.backend.application.repository.GroupMembershipRepository;
import com.upf.backend.application.repository.StudentRepository;
import com.upf.backend.application.services.Interfaces.IFollowService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
@Service
@Transactional
public class UserServiceImpl implements IUserService {

    private final StudentRepository studentRepository;
    private final IFollowService followService;
    private final EnrollmentRepository enrollmentRepository;
    private final ExamRepository examRepository;
    private final GroupMembershipRepository groupMembershipRepository;

    public UserServiceImpl(StudentRepository studentRepository,
                           IFollowService followService,
                           EnrollmentRepository enrollmentRepository,
                           ExamRepository examRepository,
                           GroupMembershipRepository groupMembershipRepository) {
        this.studentRepository = studentRepository;
        this.followService = followService;
        this.enrollmentRepository = enrollmentRepository;
        this.examRepository = examRepository;
        this.groupMembershipRepository = groupMembershipRepository;
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
                                        String storagePath,
                                        Major major,
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
        if (major != null && !major.toString().isBlank()) {
            profile.setMajor(major);
        }
        if (currentYear != null) {
            profile.setCurrentYear(currentYear);
        }
        if (profilePublic != null) {
            profile.setProfilePublic(profilePublic);
        }
        if (storagePath != null) {
            profile.setAvatarStoragePath(storagePath);
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
    public Optional<StudentPublicProfileResponse> getPublicProfileResponse(UUID studentId) {
        return getPublicProfile(studentId)
                .map(StudentMapper::toPublicResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<StudentPublicProfileResponse> getStudentPublicInfo(UUID studentId) {
        return studentRepository.findById(studentId)
                .map(StudentMapper::toPublicResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentProfile> searchPublicProfiles(String major,
                                                     Integer currentYear,
                                                     Pageable pageable) {
        Major majorEnum = parseMajor(major);
        
        if (majorEnum != null && currentYear != null) {
            return studentRepository.findByMajorAndCurrentYearAndIsProfilePublicTrue(majorEnum, currentYear, pageable);
        }

        if (majorEnum != null) {
            return studentRepository.findByMajorAndIsProfilePublicTrue(majorEnum, pageable);
        }

        if (currentYear != null) {
            return studentRepository.findByCurrentYearAndIsProfilePublicTrue(currentYear, pageable);
        }

        return studentRepository.findByIsProfilePublicTrue(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentProfileSummary> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(student -> StudentMapper.toSummaryWithFollowers(student, (int) followService.countFollowers(student.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentStatsResponse getStudentStats(UUID studentId) {
        // Vérifier que l'étudiant existe
        studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil étudiant introuvable."));

        // Compter les cours inscrits actifs
        int enrolledCoursesCount = (int) enrollmentRepository.countByStudentProfile_IdAndStatus(
                studentId, EnrollmentStatus.ACTIVE);

        // Compter les examens uploadés par cet étudiant
        int uploadedExamsCount = (int) examRepository.countByUploader_Id(studentId);

        // Compter les groupes actif
        int myGroupsCount = (int) groupMembershipRepository.countByStudentProfile_User_IdAndStatus(
                studentId, MembershipStatus.ACTIVE);

        // Compter le total des téléchargements de tous ses examens
        int totalDownloadsReceived = examRepository.findByUploader_Id(studentId)
                .stream()
                .mapToInt(Exam::getDownloadCount)
                .sum();

        return new StudentStatsResponse(
                enrolledCoursesCount,
                uploadedExamsCount,
                myGroupsCount,
                totalDownloadsReceived
        );
    }

    /**
     * Convertit une chaîne de caractères en enum Major.
     * Retourne null si la chaîne est null, vide ou invalide.
     */
    private Major parseMajor(String majorString) {
        if (majorString == null || majorString.isBlank()) {
            return null;
        }
        try {
            return Major.fromString(majorString.trim());
        } catch (IllegalArgumentException e) {
            // Si la valeur n'existe pas dans l'enum, retourner null
            return null;
        }
    }
}