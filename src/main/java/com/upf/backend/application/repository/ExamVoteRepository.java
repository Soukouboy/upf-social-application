package com.upf.backend.application.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.upf.backend.application.model.entity.ExamVote;

public interface ExamVoteRepository extends JpaRepository<ExamVote, UUID> {

}
