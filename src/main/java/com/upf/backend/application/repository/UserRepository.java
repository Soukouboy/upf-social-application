package com.upf.backend.application.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.upf.backend.application.model.entity.User;

public interface UserRepository extends JpaRepository<User, UUID> {


    
Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

}
