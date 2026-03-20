package com.upf.backend.application.repository;

import com.upf.backend.application.model.entity.Exam;
import com.upf.backend.application.model.enums.ExamType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExamRepository extends JpaRepository<Exam, UUID> {

    boolean existsByFileHash(String fileHash);

    Optional<Exam> findByIdAndIsHiddenFalse(UUID id);

    Page<Exam> findByCourse_Id(UUID courseId, Pageable pageable);

    Page<Exam> findByUploader_Id(UUID uploaderId, Pageable pageable);

    Page<Exam> findByAcademicYearAndExamType(String academicYear, ExamType examType, Pageable pageable);

    Page<Exam> findBySubjectAndAcademicYearAndExamType(
            String subject,
            String academicYear,
            ExamType examType,
            Pageable pageable
    );

    List<Exam> findByIsHiddenFalse();

    @Query("""
           select e
           from Exam e
           where e.isHidden = false
             and (:subject is null or lower(e.subject) like lower(concat('%', :subject, '%')))
             and (:major is null or lower(e.course.major) = lower(:major))
             and (:courseYear is null or e.course.year = :courseYear)
             and (:academicYear is null or e.academicYear = :academicYear)
             and (:examType is null or e.examType = :examType)
             and (:uploaderId is null or e.uploader.id = :uploaderId)
           """)
    Page<Exam> searchVisibleExams(
            @Param("subject") String subject,
            @Param("major") String major,
            @Param("courseYear") Integer courseYear,
            @Param("academicYear") String academicYear,
            @Param("examType") ExamType examType,
            @Param("uploaderId") UUID uploaderId,
            Pageable pageable
    );
}