package com.upf.backend.application.controller;

import com.upf.backend.application.dto.announcement.AnnouncementResponse;
import com.upf.backend.application.dto.course.CourseDetails;
import com.upf.backend.application.dto.course.CourseSummary;
import com.upf.backend.application.dto.courseresource.CourseResourceResponse;
import com.upf.backend.application.mapper.AnnouncementMapper;
import com.upf.backend.application.mapper.CourseMapper;
import com.upf.backend.application.mapper.CourseResourceMapper;
import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.model.entity.CourseResource;
import com.upf.backend.application.model.enums.UserRole;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.SupabaseStorageService;
import com.upf.backend.application.services.Interfaces.ICourseService;
import com.upf.backend.application.services.Interfaces.IProfessorService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/courses")
public class CourseController {

    private final ICourseService courseService;
    private final IProfessorService professorService;
    private final SupabaseStorageService fileStorageService;

    public CourseController(ICourseService courseService,
                            IProfessorService professorService,
                            SupabaseStorageService fileStorageService) {
        this.courseService = courseService;
        this.professorService = professorService;
        this.fileStorageService = fileStorageService;
    }

    // ─── Liste des cours ──────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<Page<CourseSummary>> listCourses(
            @RequestParam(required = false) String major,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String search,
            Pageable pageable
    ) {
        Page<Course> page = courseService.listCourses(major, year, semester, search, pageable);
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
        return ResponseEntity.ok(courseService.getCoursesByMajor(major)
                .stream().map(CourseMapper::toSummary).toList());
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me")
    public ResponseEntity<List<CourseSummary>> getMyCourses(Authentication auth) {
        UUID studentId = ((SecurityUser) auth.getPrincipal()).getProfileId();
        return ResponseEntity.ok(courseService.getCoursesForStudent(studentId)
                .stream().map(CourseMapper::toSummary).toList());
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR', 'ADMIN')")
    @GetMapping("/{courseId}/announcements")
    public ResponseEntity<List<AnnouncementResponse>> getAnnouncements(@PathVariable UUID courseId) {
        return ResponseEntity.ok(professorService.getAnnouncementsByCourse(courseId)
                .stream().map(AnnouncementMapper::toResponse).toList());
    }

    // ─── Ressources d'un cours ────────────────────────────────────────────────

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

    // ─── Téléchargement d'une ressource ──────────────────────────────────────
    /**
     * Deux cas :
     *  - Fichier EXTERNE (lien YouTube, Drive…) → redirection directe vers l'URL
     *  - Fichier PRIVÉ dans Supabase (bucket "documents") → URL signée 1h puis redirection
     */
    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR', 'ADMIN')")
    @GetMapping("/{courseId}/resources/{resourceId}/download")
    public ResponseEntity<Void> downloadResource(
            @PathVariable UUID courseId,
            @PathVariable UUID resourceId,
            Authentication auth) {

        // ── Vérification des droits ──────────────────────────────────────────
        SecurityUser currentUser = (SecurityUser) auth.getPrincipal();
        UserRole role = currentUser.getRole();

        if (role == UserRole.STUDENT) {
            boolean hasAccess = courseService.hasStudentAccess(courseId, currentUser.getProfileId());
            if (!hasAccess) {
                throw new RuntimeException("Accès refusé : vous n'êtes pas inscrit à ce cours.");
            }
        }
        // PROFESSOR et ADMIN ont toujours accès

        // ── Récupérer la ressource ───────────────────────────────────────────
        Course course = courseService.getCourseDetails(courseId);
        CourseResource resource = course.getResources().stream()
                .filter(r -> r.getId().equals(resourceId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Ressource introuvable."));

        // ── Fichier externe → redirection directe ────────────────────────────
        if (resource.isExternal()) {
            return ResponseEntity.status(302)
                    .location(URI.create(resource.getFileUrl()))
                    .build();
        }

        // ── Fichier Supabase privé → URL signée 1h ───────────────────────────
        // resource.getStoragePath() = "user-{uuid}/nom-fichier.pdf"
        String signedUrl = fileStorageService.generateSignedUrl(
                "documents",
                resource.getFileUrl(),
                3600  // 1 heure
        );

        return ResponseEntity.status(302)
                .location(URI.create(signedUrl))
                .build();
    }
}