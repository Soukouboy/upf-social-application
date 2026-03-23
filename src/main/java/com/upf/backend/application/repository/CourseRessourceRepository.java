package com.upf.backend.application.repository;

import java.util.UUID;
import com.upf.backend.application.model.entity.CourseResource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRessourceRepository extends JpaRepository<CourseResource, UUID> {

}
