package com.upf.backend.application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

<<<<<<< HEAD
import com.upf.backend.application.model.entity.ProfessorProfile;

import java.util.*;

=======
import java.util.*;

import com.upf.backend.application.model.entity.ProfessorProfile;

>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164
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

    @Query("select distinct p from ProfessorProfile p left join fetch p.courses")
    List<ProfessorProfile> findAllWithCourses();

    // ✅ Correct
    boolean existsByUser_Id(UUID userId);
} 
 
