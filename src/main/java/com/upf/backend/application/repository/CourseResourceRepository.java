package com.upf.backend.application.repository;

import com.upf.backend.application.model.entity.CourseResource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseResourceRepository extends JpaRepository<CourseResource, UUID> {

    List<CourseResource> findByCourse_Id(UUID courseId);

    Optional<CourseResource> findByIdAndCourse_Id(UUID resourceId, UUID courseId);

    List<CourseResource> findByUploadedByProfessorProfileId(UUID professorId);
    long countByCourse_Id(UUID courseId);

    // ✅ Fonctionne car uploadedBy est maintenant une entité User
    List<CourseResource> findByUploadedBy_Id(UUID userId);

}