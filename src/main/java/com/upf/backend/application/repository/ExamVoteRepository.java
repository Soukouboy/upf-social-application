package com.upf.backend.application.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.upf.backend.application.model.entity.ExamVote;

public interface ExamVoteRepository extends JpaRepository<ExamVote, UUID> {
    Optional<ExamVote> findByExam_IdAndStudent_Id(UUID examId, UUID studentId);
}
