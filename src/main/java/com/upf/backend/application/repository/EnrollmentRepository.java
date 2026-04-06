package com.upf.backend.application.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.upf.backend.application.model.entity.Enrollment;
import com.upf.backend.application.model.enums.EnrollmentStatus;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    // Déjà probablement présent
    Optional<Enrollment> findByStudentProfile_IdAndCourse_Id(UUID studentId, UUID courseId);
    boolean existsByStudentProfile_IdAndCourse_Id(UUID studentId, UUID courseId);
    List<Enrollment> findByStudentProfile_Id(UUID studentId);

    // ✅ À ajouter — pour que le prof consulte ses étudiants
    List<Enrollment> findByCourse_Id(UUID courseId);
    List<Enrollment> findByCourse_IdAndStatus(UUID courseId, EnrollmentStatus status);
    List<Enrollment> findByCourse_IdAndCourse_Professor_Id(UUID courseId, UUID professorId);
      List<Enrollment> findByStudentProfile_IdAndStatus(UUID studentId, EnrollmentStatus status);
      boolean existsByStudentProfile_IdAndCourse_IdAndStatus(UUID studentId, UUID courseId, EnrollmentStatus active);
}