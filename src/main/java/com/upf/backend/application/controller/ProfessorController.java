package com.upf.backend.application.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.apache.catalina.connector.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.upf.backend.application.controller.request.AnnouncementRequest;
import com.upf.backend.application.controller.request.UploadResourceRequest;
import com.upf.backend.application.dto.announcement.AnnouncementResponse;
import com.upf.backend.application.dto.course.CourseSummary;
import com.upf.backend.application.dto.courseresource.CourseResourceResponse;
import com.upf.backend.application.dto.student.StudentProfileSummary;
import com.upf.backend.application.mapper.AnnouncementMapper;
import com.upf.backend.application.mapper.CourseMapper;
import com.upf.backend.application.mapper.CourseResourceMapper;
import com.upf.backend.application.mapper.StudentMapper;
import com.upf.backend.application.model.entity.Announcement;
import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.model.entity.CourseResource;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.enums.FileType;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.LocalFileStorageService;
import com.upf.backend.application.services.Interfaces.IProfessorService;
import com.upf.backend.application.services.Interfaces.StoredFileDescriptor;

@RestController
@RequestMapping("/professors")
@PreAuthorize("hasRole('PROFESSOR')") // Restreint l'accès à tous les endpoints de ce contrôleur aux utilisateurs ayant le rôle "PROFESSOR"
public class ProfessorController {
    
    private final IProfessorService professorService;
    private final LocalFileStorageService fileStorageService;

    public ProfessorController(IProfessorService professorService, LocalFileStorageService fileStorageService) {
        this.professorService = professorService;
        this.fileStorageService = fileStorageService;
    }

    // Mes cours 

    @GetMapping("/me/courses")
    public ResponseEntity<List<CourseSummary>> getMyCourses( Authentication auth   ) {
        UUID profileId = profileId(auth);
        List<CourseSummary> summaries = professorService.getMyCourses(profileId)
                .stream()
                .map(CourseMapper::toSummary)
                .toList();
        if (summaries.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(summaries);
    }

      // ─── Étudiants d'un cours ────────────────────────────────────────────────

    @GetMapping("/me/courses/{courseId}/students")
    public ResponseEntity<List<StudentProfileSummary>> getStudents(Authentication auth,
                                                             @PathVariable UUID courseId) {
       List<StudentProfileSummary> summaries = professorService.getStudentsInCourse(profileId(auth), courseId);
        return ResponseEntity.ok(summaries);
    }

    
    // ─── Ressources ──────────────────────────────────────────────────────────

// ✅ Après — même pattern que ExamController
@PostMapping(value = "/me/courses/{courseId}/resources",
             consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<CourseResourceResponse> uploadResource(
        @AuthenticationPrincipal SecurityUser currentUser,
        @PathVariable UUID courseId,
        @RequestParam String title,
        @RequestParam FileType fileType,
        @RequestParam(required = false, defaultValue = "false") boolean isExternal,
        @RequestPart("file") MultipartFile file) throws IOException {

    byte[] content    = file.getBytes();
    long   fileSize   = file.getSize();
    String fileName   = file.getOriginalFilename();

    // ✅ Déléguer le stockage à IFileStorageService (même que pour les exams)
    StoredFileDescriptor storedFile = fileStorageService.storeCourseResource(fileName,fileType,fileSize,content );

    CourseResource resource = professorService.uploadResource(
            currentUser.getProfileId(),
            courseId,
            title,
            storedFile.publicUrl(),
            fileType,
            fileSize,
            isExternal
    );

    return ResponseEntity.status(HttpStatus.CREATED)
            .body(CourseResourceMapper.toResponse(resource));
}

    // ------- Annonces ──────────────────────────────────────────────────────────

   @PostMapping("/me/courses/{courseId}/announcements")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(Authentication auth,
                                                            @PathVariable UUID courseId,
                                                            @RequestBody AnnouncementRequest req) {
        Announcement announcement = professorService.createAnnouncement(
                profileId(auth), courseId, req.title(), req.content());
        return ResponseEntity.status(HttpStatus.CREATED).body(AnnouncementMapper.toResponse(announcement));
    }

    @DeleteMapping("/me/announcements/{announcementId}")
    public ResponseEntity<Void> deleteAnnouncement(Authentication auth,
                                                    @PathVariable UUID announcementId) {
        professorService.deleteAnnouncement(profileId(auth), announcementId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/announcements")
    public ResponseEntity<List<AnnouncementResponse>> getMyAnnouncements(Authentication auth) {
        List<AnnouncementResponse> responses = professorService.getAnnouncementsByProfessor(profileId(auth))
                .stream()
                .map(AnnouncementMapper::toResponse)
                .toList();
        if (responses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(responses);
    }

    // HELPER METHODS
     private UUID profileId(Authentication auth) {
        return ((SecurityUser) auth.getPrincipal()).getProfileId();
    }
}

