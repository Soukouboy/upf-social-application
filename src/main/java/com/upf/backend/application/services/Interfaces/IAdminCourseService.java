package com.upf.backend.application.services.Interfaces;

import com.upf.backend.application.controller.request.CreateCourseRequest;
import com.upf.backend.application.controller.request.UpdateCourseRequest;
import com.upf.backend.application.model.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface IAdminCourseService {

    Course createCourse(CreateCourseRequest request);

    Course updateCourse(UUID courseId, UpdateCourseRequest request);

    Course getCourse(UUID courseId);

    Page<Course> listAllCourses(Pageable pageable);

    Course activateCourse(UUID courseId);

    Course deactivateCourse(UUID courseId);

    void deleteCourse(UUID courseId);
}