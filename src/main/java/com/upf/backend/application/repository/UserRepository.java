package com.upf.backend.application.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.upf.backend.application.model.entity.User;
import com.upf.backend.application.model.enums.UserRole;

public interface UserRepository extends JpaRepository<User, UUID> {


    
Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(UserRole admin);

    int countByIsActive(boolean b);

}


