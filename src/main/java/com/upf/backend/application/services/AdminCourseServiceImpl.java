package com.upf.backend.application.services;
import com.upf.backend.application.controller.request.CreateCourseRequest;
import com.upf.backend.application.controller.request.UpdateCourseRequest;
import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.repository.CourseRepository;
import com.upf.backend.application.services.Exceptions.BusinessException;
import com.upf.backend.application.services.Exceptions.ResourceNotFoundException;
import com.upf.backend.application.services.Interfaces.IAdminCourseService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class AdminCourseServiceImpl implements IAdminCourseService {

    private final CourseRepository courseRepository;

    public AdminCourseServiceImpl(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    public Course createCourse(CreateCourseRequest request) {
        validateCreateRequest(request);

        String normalizedCode = request.code().trim().toUpperCase();

        if (courseRepository.existsByCode(normalizedCode)) {
            throw new BusinessException("Un cours existe déjà avec le code : " + normalizedCode);
        }

  

        Course course = new Course();
        course.setCode(normalizedCode);
        course.setTitle(request.title().trim());
        course.setDescription(request.description() != null ? request.description() : "desc");
        course.setObjectives("À définir");
        course.setPrerequisites("À définir");
        course.setMajor(request.major().trim());
        course.setYear(4);
        course.setSemester(request.semester());
        course.setCredits(request.credits() == null ? 0 : request.credits());
        course.setInstructorName("À assigner");
        course.setActive(true);

        return courseRepository.save(course);
    }

    @Override
    public Course updateCourse(UUID courseId, UpdateCourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable."));

        if (request.code() != null && !request.code().isBlank()) {
            String normalizedCode = request.code().trim().toUpperCase();

            if (!normalizedCode.equalsIgnoreCase(course.getCode())
                    && courseRepository.existsByCode(normalizedCode)) {
                throw new BusinessException("Un autre cours existe déjà avec le code : " + normalizedCode);
            }

            course.setCode(normalizedCode);
        }

        if (request.title() != null && !request.title().isBlank()) {
            course.setTitle(request.title().trim());
        }

        if (request.description() != null) {
            course.setDescription(request.description());
        }

        if (request.objectives() != null) {
            course.setObjectives(request.objectives());
        }

        if (request.prerequisites() != null) {
            course.setPrerequisites(request.prerequisites());
        }

        if (request.major() != null && !request.major().isBlank()) {
            course.setMajor(request.major().trim());
        }

        if (request.year() != null) {
            validateYear(request.year());
            course.setYear(request.year());
        }

        if (request.semester() != null) {
            validateSemester(request.semester());
            course.setSemester(request.semester());
        }

        if (request.credits() != null) {
            if (request.credits() < 0) {
                throw new BusinessException("Le nombre de crédits ne peut pas être négatif.");
            }
            course.setCredits(request.credits());
        }

        if (request.instructorName() != null && !request.instructorName().isBlank()) {
            course.setInstructorName(request.instructorName().trim());
        }

        if (request.active() != null) {
            course.setActive(request.active());
        }

        return courseRepository.save(course);
    }

    @Override
    @Transactional(readOnly = true)
    public Course getCourse(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable."));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Course> listAllCourses(Pageable pageable) {
        return courseRepository.findAll(pageable);
    }

    @Override
    public Course activateCourse(UUID courseId) {
        Course course = getCourse(courseId);
        course.setActive(true);
        return courseRepository.save(course);
    }

    @Override
    public Course deactivateCourse(UUID courseId) {
        Course course = getCourse(courseId);
        course.setActive(false);
        return courseRepository.save(course);
    }

    @Override
    public void deleteCourse(UUID courseId) {
        Course course = getCourse(courseId);
        courseRepository.delete(course);
    }

    private void validateCreateRequest(CreateCourseRequest request) {
        if (request == null) {
            throw new BusinessException("La requête de création de cours est obligatoire.");
        }

        if (request.code() == null || request.code().isBlank()) {

            throw new BusinessException("Le code du cours est obligatoire.");
        }

        if (request.title() == null || request.title().isBlank()) {
            throw new BusinessException("Le titre du cours est obligatoire.");
        }

        if (request.major() == null || request.major().isBlank()) {
            throw new BusinessException("La filière est obligatoire.");
        }

        
        if (request.semester() == null) {
            throw new BusinessException("Le semestre est obligatoire.");
        }

      

    
        validateSemester(request.semester());

        if (request.credits() != null && request.credits() < 0) {
            throw new BusinessException("Le nombre de crédits ne peut pas être négatif.");
        }

        if (request.code().length() > 20) {
            throw new BusinessException("Le code du cours ne peut pas dépasser 20 caractères.");
        }

        if (request.title().length() > 200) {
            throw new BusinessException("Le titre du cours ne peut pas dépasser 200 caractères.");
        }

    }


    private void validateYear(int year) {
        if (year < 1 || year > 7) {
            throw new BusinessException("L'année doit être comprise entre 1 et 7.");
        }
    }

    private void validateSemester(int semester) {
        if (semester < 1 || semester > 2) {
            throw new BusinessException("Le semestre doit être compris entre 1 et 2.");
        }
    }

}

