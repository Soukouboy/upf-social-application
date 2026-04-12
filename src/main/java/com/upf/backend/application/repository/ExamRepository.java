package com.upf.backend.application.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.upf.backend.application.model.entity.Exam;
import com.upf.backend.application.model.enums.ExamType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExamRepository extends JpaRepository<Exam, UUID>,
        JpaSpecificationExecutor<Exam> {

    boolean existsByFileHash(String fileHash);
    Optional<Exam> findByIdAndIsHiddenFalse(UUID id);
    Page<Exam> findByCourse_Id(UUID courseId, Pageable pageable);
    Page<Exam> findByUploader_Id(UUID uploaderId, Pageable pageable);
    List<Exam> findByIsHiddenFalse();
    long countByUploader_Id(UUID uploaderId);
    List<Exam> findByUploader_Id(UUID uploaderId);
}