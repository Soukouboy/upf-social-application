package com.upf.backend.application.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.upf.backend.application.model.entity.Course;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {

    boolean existsByCode(String code);

    List<Course> findByMajorAndYearAndSemester(String major, int year, int semester);

    Page<Course> findByMajorAndYearAndSemesterAndIsActiveTrue(
            String major,
            int year,
            int semester,
            Pageable pageable
    );

    Page<Course> findByMajorAndYearAndIsActiveTrue(
            String major,
            int year,
            Pageable pageable
    );

    Page<Course> findByMajor(String major, Pageable pageable);

    Page<Course> findByYear(int year, Pageable pageable);

    Page<Course> findBySemester(int semester, Pageable pageable);

    List<Course> findByInstructorName(String instructorName);

    @Query(value = """
           SELECT c.id, c.code, c.created_at, c.credits, c.description, c.instructor_name,
                  c.is_active, c.major, c.objectives, c.prerequisites, c.professor_id,
                  c.semester, c.title, c.updated_at, c.year
           FROM courses c
           WHERE c.is_active = true
             AND (:major IS NULL OR LOWER(c.major) = LOWER(:major))
             AND (:year IS NULL OR c.year = :year)
             AND (:semester IS NULL OR c.semester = :semester)
             AND (
                   :search IS NULL
                   OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(c.instructor_name) LIKE LOWER(CONCAT('%', :search, '%'))
                 )
           """,
           countQuery = """
           SELECT COUNT(*)
           FROM courses c
           WHERE c.is_active = true
             AND (:major IS NULL OR LOWER(c.major) = LOWER(:major))
             AND (:year IS NULL OR c.year = :year)
             AND (:semester IS NULL OR c.semester = :semester)
             AND (
                   :search IS NULL
                   OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(c.instructor_name) LIKE LOWER(CONCAT('%', :search, '%'))
                 )
           """,
           nativeQuery = true)
    Page<Course> searchActiveCourses(
            @Param("major") String major,
            @Param("year") Integer year,
            @Param("semester") Integer semester,
            @Param("search") String search,
            Pageable pageable
    );

    List<Course> findByProfessor_Id(UUID professorId);
}