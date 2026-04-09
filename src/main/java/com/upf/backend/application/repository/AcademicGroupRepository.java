package com.upf.backend.application.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.upf.backend.application.model.entity.AcademicGroup;

import java.util.UUID;

public interface AcademicGroupRepository extends JpaRepository<AcademicGroup, UUID> {

}