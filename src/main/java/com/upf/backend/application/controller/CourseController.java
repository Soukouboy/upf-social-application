package com.upf.backend.application.controller;

import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.services.CourseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<Page<Course>> listCourses(
            @RequestParam(required = false) String major,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String search,
            Pageable pageable
    ) {
        Page<Course> page = courseService.listCourses(
                major,
                year,
                semester,
                search,
                pageable
        );
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<Course> getCourseDetails(@PathVariable UUID courseId) {
        Course course = courseService.getCourseDetails(courseId);
        return ResponseEntity.ok(course);
    }
}