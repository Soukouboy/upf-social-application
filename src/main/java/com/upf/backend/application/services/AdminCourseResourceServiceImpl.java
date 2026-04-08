package com.upf.backend.application.services;

import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.model.entity.CourseResource;
import com.upf.backend.application.model.enums.FileType;
import com.upf.backend.application.repository.CourseRepository;
import com.upf.backend.application.repository.CourseResourceRepository;
import com.upf.backend.application.services.Exceptions.BusinessException;
import com.upf.backend.application.services.Exceptions.ResourceNotFoundException;
import com.upf.backend.application.services.Interfaces.IAdminCourseResourceService;
import com.upf.backend.application.services.Interfaces.StoredFileDescriptor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AdminCourseResourceServiceImpl implements IAdminCourseResourceService {

    private final NotificationService notificationService;
    private final CourseRepository courseRepository;
    private final CourseResourceRepository courseResourceRepository;
    private final SupabaseStorageService fileStorageService;

    public AdminCourseResourceServiceImpl(CourseRepository courseRepository,
                                          CourseResourceRepository courseResourceRepository,
                                          SupabaseStorageService fileStorageService, NotificationService notificationService) {
        this.courseRepository = courseRepository;
        this.courseResourceRepository = courseResourceRepository;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
    }

    @Override
    public CourseResource addExternalCourseResourceLink(UUID courseId,
                                                        String title,
                                                        String description,
                                                        String externalUrl) {
        validateTitle(title);

        if (externalUrl == null || externalUrl.isBlank()) {
            throw new BusinessException("L'URL externe est obligatoire.");
        }

        Course course = loadCourse(courseId);

        CourseResource resource = new CourseResource();

        // ===== ADAPTE CES SETTERS SI TON ENTITÉ A D’AUTRES NOMS =====
        resource.setTitle(title.trim());
        resource.setFileUrl(externalUrl.trim());
        resource.setFileType(FileType.LINK);
        resource.setFileSizeBytes(0L);
        resource.setExternal(true);
        // ============================================================

        course.addResource(resource);

        Course savedCourse = courseRepository.save(course);
        notificationService.notifyNewResource(resource);
        return savedCourse.getResources().get(savedCourse.getResources().size() - 1);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResource> listCourseResources(UUID courseId) {
        loadCourse(courseId);
        return courseResourceRepository.findByCourse_Id(courseId);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResource getCourseResource(UUID courseId, UUID resourceId) {
        loadCourse(courseId);

        return courseResourceRepository.findByIdAndCourse_Id(resourceId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Ressource de cours introuvable."));
    }

    @Override
    public void deleteCourseResource(UUID courseId, UUID resourceId) {
        Course course = loadCourse(courseId);

        CourseResource resource = courseResourceRepository.findByIdAndCourse_Id(resourceId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Ressource de cours introuvable."));

        course.removeResource(resource);
        courseRepository.save(course);
    }

    private Course loadCourse(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable."));
    }

    private void validateTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new BusinessException("Le titre de la ressource est obligatoire.");
        }
    }
}