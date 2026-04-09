package com.upf.backend.application.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.upf.backend.application.model.entity.ExamReport;
import com.upf.backend.application.model.enums.ReportStatus;

public interface ExamReportRepository extends JpaRepository<ExamReport, UUID> {

    long countByStatus(ReportStatus status);

    @Query("SELECT er FROM ExamReport er JOIN FETCH er.exam JOIN FETCH er.reportedBy ORDER BY er.createdAt DESC")
    List<ExamReport> findAllWithExamAndReporter();
}
