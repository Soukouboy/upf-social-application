package com.upf.backend.application.controller;

import com.upf.backend.application.dto.announcement.AnnouncementResponse;
import com.upf.backend.application.dto.course.CourseDetails;
import com.upf.backend.application.dto.course.CourseSummary;
import com.upf.backend.application.dto.courseresource.CourseResourceResponse;
import com.upf.backend.application.mapper.AnnouncementMapper;
import com.upf.backend.application.mapper.CourseMapper;
import com.upf.backend.application.mapper.CourseResourceMapper;
import com.upf.backend.application.model.entity.Announcement;
import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.model.entity.CourseResource;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.CourseService;
import com.upf.backend.application.services.Interfaces.ICourseService;
import com.upf.backend.application.services.Interfaces.IProfessorService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/courses")
public class CourseController {

    private final ICourseService courseService;
    private final IProfessorService professorService;


    public CourseController(ICourseService courseService,IProfessorService professorService) {
        this.courseService = courseService;
        this.professorService = professorService;
    }

    @GetMapping
    public ResponseEntity<Page<CourseSummary>> listCourses(
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
        return ResponseEntity.ok(page.map(CourseMapper::toSummary));
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDetails> getCourseDetails(@PathVariable UUID courseId) {
        Course course = courseService.getCourseDetails(courseId);
        return ResponseEntity.ok(CourseMapper.toDetails(course));
    }

 

   

    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR', 'ADMIN')")
    @GetMapping("/major/{major}")
    public ResponseEntity<List<CourseSummary>> getByMajor(@PathVariable String major) {
        return ResponseEntity.ok(courseService.getCoursesByMajor(major).stream().map(CourseMapper::toSummary).toList());
    }

     @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me")
    public ResponseEntity<List<CourseSummary>> getMyCourses(Authentication auth) {
        UUID studentId = ((SecurityUser) auth.getPrincipal()).getProfileId();
        return ResponseEntity.ok(courseService.getCoursesForStudent(studentId).stream()
                .map(CourseMapper::toSummary)
                .toList());
    }

     @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR', 'ADMIN')")
    @GetMapping("/{courseId}/announcements")
    public ResponseEntity<List<AnnouncementResponse>> getAnnouncements(@PathVariable UUID courseId) {
        return ResponseEntity.ok(professorService.getAnnouncementsByCourse(courseId).stream()
                .map(AnnouncementMapper::toResponse)
                .toList());
    }

    // ─── Ressources d'un cours (STUDENT et PROFESSOR) ────────────────────────

    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR', 'ADMIN')")
    @GetMapping("/{courseId}/resources")
    public ResponseEntity<List<CourseResourceResponse>> getResources(@PathVariable UUID courseId) {
          List<CourseResourceResponse> responses = courseService.getCourseDetails(courseId)
                .getResources()
                .stream()
                .map(CourseResourceMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

}