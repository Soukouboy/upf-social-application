package com.upf.backend.application.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.upf.backend.application.model.entity.ExamReport;

public interface ExamReportRepository extends JpaRepository<ExamReport, UUID> {

}
