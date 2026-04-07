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

    @Query("""
           select c
           from Course c
           where c.isActive = true
             and (:major is null or lower(c.major) = lower(:major))
             and (:year is null or c.year = :year)
             and (:semester is null or c.semester = :semester)
             and (
                   :search is null
                   or lower(c.title) like lower(concat('%', :search, '%'))
                   or lower(c.description) like lower(concat('%', :search, '%'))
                   or lower(c.instructorName) like lower(concat('%', :search, '%'))
                 )
           """)
    Page<Course> searchActiveCourses(
            @Param("major") String major,
            @Param("year") Integer year,
            @Param("semester") Integer semester,
            @Param("search") String search,
            Pageable pageable
    );

    List<Course> findByProfessor_Id(UUID professorId);
}