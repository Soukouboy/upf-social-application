package com.upf.backend.application.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.upf.backend.application.model.entity.Exam;
import com.upf.backend.application.model.enums.ExamType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExamRepository extends JpaRepository<Exam, UUID> {

    boolean existsByFileHash(String fileHash);

    Optional<Exam> findByIdAndIsHiddenFalse(UUID id);

    Page<Exam> findByCourse_Id(UUID courseId, Pageable pageable);

    Page<Exam> findByUploader_Id(UUID uploaderId, Pageable pageable);

    Page<Exam> findByAcademicYearAndExamType(String academicYear, ExamType examType, Pageable pageable);

    Page<Exam> findByTitleAndAcademicYearAndExamType(
            String title,
            String academicYear,
            ExamType examType,
            Pageable pageable
    );

    List<Exam> findByIsHiddenFalse();

   @Query(value = """
        SELECT e.id, e.academic_year, e.course_id, e.created_at, e.description,
               e.download_count, e.downvote_count, e.exam_date, e.exam_type,
               e.file_hash, e.file_size_bytes, e.file_url, e.is_hidden, e.title,
               e.updated_at, e.uploader_id, e.upvote_count
        FROM exams e
        JOIN courses c ON c.id = e.course_id
        WHERE e.is_hidden = false
          AND (:title IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :title, '%')))
          AND (:major IS NULL OR LOWER(c.major) = LOWER(:major))
          AND (:courseYear IS NULL OR c.year = :courseYear)
          AND (:academicYear IS NULL OR e.academic_year = :academicYear)
          AND (:examType IS NULL OR e.exam_type = :examType)
          AND (:uploaderId IS NULL OR e.uploader_id = :uploaderId)
    """,
    countQuery = """
        SELECT COUNT(*)
        FROM exams e
        JOIN courses c ON c.id = e.course_id
        WHERE e.is_hidden = false
          AND (:title IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :title, '%')))
          AND (:major IS NULL OR LOWER(c.major) = LOWER(:major))
          AND (:courseYear IS NULL OR c.year = :courseYear)
          AND (:academicYear IS NULL OR e.academic_year = :academicYear)
          AND (:examType IS NULL OR e.exam_type = :examType)
          AND (:uploaderId IS NULL OR e.uploader_id = :uploaderId)
    """,
    nativeQuery = true)
    Page<Exam> searchVisibleExams(
            @Param("title") String title,
            @Param("major") String major,
            @Param("courseYear") Integer courseYear,
            @Param("academicYear") String academicYear,
            @Param("examType") ExamType examType,
            @Param("uploaderId") UUID uploaderId,
            Pageable pageable
    );

    // Méthodes de comptage
    long countByUploader_Id(UUID uploaderId);
    List<Exam> findByUploader_Id(UUID uploaderId);
}