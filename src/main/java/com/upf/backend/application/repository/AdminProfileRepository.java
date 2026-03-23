package com.upf.backend.application.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.upf.backend.application.model.entity.AdminProfile;
import com.upf.backend.application.model.enums.AdminLevel;

public interface AdminProfileRepository extends JpaRepository<AdminProfile, UUID> {

    
 Optional<AdminProfile> findByUser_Id(UUID userId);

    Optional<AdminProfile> findByUser_Email(String email);

    boolean existsByUser_Id(UUID userId);

    long countByAdminLevel(AdminLevel adminLevel);

    List<AdminProfile> findByAdminLevel(AdminLevel adminLevel);


}
