package com.upf.backend.application.controller;

import com.upf.backend.application.controller.request.CreateCourseRequest;
import com.upf.backend.application.controller.request.UpdateCourseRequest;
import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.services.Interfaces.IAdminCourseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/courses")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
public class AdminCourseController {

    private final IAdminCourseService adminCourseService;

    public AdminCourseController(IAdminCourseService adminCourseService) {
        this.adminCourseService = adminCourseService;
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody CreateCourseRequest request) {
        Course created = adminCourseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<Course> updateCourse(@PathVariable UUID courseId,
                                               @RequestBody UpdateCourseRequest request) {
        Course updated = adminCourseService.updateCourse(courseId, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<Course> getCourse(@PathVariable UUID courseId) {
        Course course = adminCourseService.getCourse(courseId);
        return ResponseEntity.ok(course);
    }

    @GetMapping
    public ResponseEntity<Page<Course>> listAllCourses(Pageable pageable) {
        Page<Course> page = adminCourseService.listAllCourses(pageable);
        return ResponseEntity.ok(page);
    }

    @PatchMapping("/{courseId}/activate")
    public ResponseEntity<Course> activateCourse(@PathVariable UUID courseId) {
        Course updated = adminCourseService.activateCourse(courseId);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{courseId}/deactivate")
    public ResponseEntity<Course> deactivateCourse(@PathVariable UUID courseId) {
        Course updated = adminCourseService.deactivateCourse(courseId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable UUID courseId) {
        adminCourseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }
}