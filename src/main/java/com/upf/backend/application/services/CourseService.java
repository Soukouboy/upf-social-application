package com.upf.backend.application.services;
 
import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.repository.CourseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.upf.backend.application.services.Exceptions.ResourceNotFoundException;
import com.upf.backend.application.services.Interfaces.ICourseService;

import java.util.UUID;

@Service
@Transactional
public class CourseService implements ICourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Course> listCourses(String major,
                                    Integer year,
                                    Integer semester,
                                    String search,
                                    Pageable pageable) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();

        return courseRepository.searchActiveCourses(
                major,
                year,
                semester,
                normalizedSearch,
                pageable
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Course getCourseDetails(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable."));

        if (!course.isActive()) {
            throw new ResourceNotFoundException("Cours introuvable ou inactif.");
        }

        // Les ressources seront accessibles via course.getResources()
        // si la relation est correctement mappée.
        return course;
    }
}