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
import com.upf.backend.application.model.enums.UserRole;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.CourseService;
import com.upf.backend.application.services.Interfaces.ICourseService;
import com.upf.backend.application.services.Interfaces.IFileStorageService;
import com.upf.backend.application.services.Interfaces.IProfessorService;

import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
    private final IFileStorageService fileStorageService;


    public CourseController(ICourseService courseService,IProfessorService professorService, IFileStorageService fileStorageService) {
        this.courseService = courseService;
        this.professorService = professorService;
        this.fileStorageService = fileStorageService;
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

    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR', 'ADMIN')")
    @GetMapping("/{courseId}/resources/{resourceId}/download")
    public ResponseEntity<Resource> downloadResource(@PathVariable UUID courseId,
                                                     @PathVariable UUID resourceId,
                                                     Authentication auth) {
        // Vérifier l'accès
        SecurityUser currentUser = (SecurityUser) auth.getPrincipal();
        UserRole role = currentUser.getRole();

        if (role == UserRole.STUDENT) {
            boolean hasAccess = courseService.hasStudentAccess(courseId, currentUser.getProfileId());
            if (!hasAccess) {
                throw new RuntimeException("Accès refusé : vous n'êtes pas inscrit à ce cours.");
            }
        } else if (role == UserRole.PROFESSOR) {
            // Pour les professeurs, vérifier qu'ils enseignent ce cours
            // TODO: ajouter une méthode pour vérifier si le professeur enseigne ce cours
        }
        // ADMIN a toujours accès

        // Récupérer la ressource
        Course course = courseService.getCourseDetails(courseId);
        CourseResource resource = course.getResources().stream()
                .filter(r -> r.getId().equals(resourceId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Ressource introuvable."));

        // Si c'est un lien externe, rediriger
        if (resource.isExternal()) {
            return ResponseEntity.status(302)
                    .header(HttpHeaders.LOCATION, resource.getFileUrl())
                    .build();
        }

        // Charger le fichier
        String relativePath = extractRelativePath(resource.getFileUrl());
        Resource fileResource = fileStorageService.loadAsResource(relativePath);

        // Incrémenter le compteur de téléchargements
        resource.setDownloadCount(resource.getDownloadCount() + 1);
        // TODO: sauvegarder en base (nécessite un repository)

        // Préparer les headers
        String filename = resource.getTitle() + "." + getExtensionFromFileType(resource.getFileType());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename(filename, java.nio.charset.StandardCharsets.UTF_8)
                        .build()
        );

        MediaType mediaType = resolveMediaType(resource.getFileType());

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(mediaType)
                .body(fileResource);
    }

    private String extractRelativePath(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new IllegalArgumentException("URL de fichier invalide.");
        }

        int index = fileUrl.indexOf("/course-resources/");
        if (index >= 0) {
            return fileUrl.substring(index + 1); // => "course-resources/uuid.pdf"
        }

        // fallback simple si déjà relatif
        if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://") && !fileUrl.startsWith("/")) {
            return fileUrl;
        }

        throw new IllegalArgumentException("Impossible d'extraire le chemin relatif depuis l'URL : " + fileUrl);
    }

    private String getExtensionFromFileType(com.upf.backend.application.model.enums.FileType fileType) {
        return switch (fileType) {
            case PDF -> "pdf";
            case DOCX -> "docx";
            case PPT -> "pptx";
            case LINK -> ""; // pas d'extension pour les liens
            default -> "bin";
        };
    }

    private MediaType resolveMediaType(com.upf.backend.application.model.enums.FileType fileType) {
        if (fileType == null) return MediaType.APPLICATION_OCTET_STREAM;

        return switch (fileType) {
            case PDF -> MediaType.APPLICATION_PDF;
            case DOCX -> MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            case PPT -> MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.presentationml.presentation");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }

}