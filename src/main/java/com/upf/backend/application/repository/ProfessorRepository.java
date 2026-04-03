package com.upf.backend.application.repository;



import javax.security.auth.Subject;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
import com.upf.backend.application.model.entity.Announcement;
import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.model.entity.Enrollment;
import com.upf.backend.application.model.entity.ProfessorProfile;

public interface ProfessorRepository extends JpaRepository<ProfessorProfile, UUID> {

    // ✅ findById déjà hérité de JpaRepository — à supprimer
    // Optional<ProfessorProfile> findById(UUID professorId); ← SUPPRIMER

    // ✅ Correct
    Optional<ProfessorProfile> findByUser_Id(UUID userId);

    // ✅ Correct
    Optional<ProfessorProfile> findByUser_Email(String email);

    // ✅ Correct — retourne des ProfessorProfile qui ont des cours dans cette filière
    List<ProfessorProfile> findByCourses_Major(String filiere);

    // ✅ Correct — retourne des ProfessorProfile qui ont ce cours
    Optional<ProfessorProfile> findByCourses_Code(String code);

    // ✅ Correct
    boolean existsByUser_Id(UUID userId);
} 
 
