package com.upf.backend.application.repository;

import com.upf.backend.application.model.entity.StudentProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<StudentProfile, UUID> {

    // Authentification / unicité email (email porté par User)
    Optional<StudentProfile> findByUser_Email(String email);

    boolean existsByUser_Email(String email);

    // Profil / recherche par filière et année
    List<StudentProfile> findByMajorAndCurrentYear(String major, int currentYear);

    Page<StudentProfile> findByMajorAndCurrentYear(String major, int currentYear, Pageable pageable);

    // Profils publics
    List<StudentProfile> findByIsProfilePublicTrue();

    Page<StudentProfile> findByIsProfilePublicTrue(Pageable pageable);

    Page<StudentProfile> findByMajor(String major, Pageable pageable);

    Page<StudentProfile> findByCurrentYear(int currentYear, Pageable pageable);

     // Added methods for public profiles with major and/or currentYear
    Page<StudentProfile> findByMajorAndCurrentYearAndIsProfilePublicTrue(String major, int currentYear, Pageable pageable);

    Page<StudentProfile> findByMajorAndIsProfilePublicTrue(String major, Pageable pageable);

    Page<StudentProfile> findByCurrentYearAndIsProfilePublicTrue(int currentYear, Pageable pageable);
}