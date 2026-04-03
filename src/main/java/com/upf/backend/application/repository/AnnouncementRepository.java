package com.upf.backend.application.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.upf.backend.application.model.entity.Announcement;


    
 public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {
 List<Announcement> findByCourse_IdOrderByCreatedAtDesc(UUID courseId);
    List<Announcement> findByProfessor_Id(UUID professorId);

}
