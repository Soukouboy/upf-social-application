# 💡 Guide Rapide : Exemples de Code pour Mise à Jour des Controllers

Ce document fournit des exemples prêts à copier-coller pour mettre à jour vos controllers.

---

## 🔴 AVANT / ✅ APRÈS

### Pattern 1: Endpoint de Détail (GET avec UUID)

```java
// ❌ AVANT (exposerait les entités JPA)
@GetMapping("/{courseId}")
public ResponseEntity<Course> getCourseDetails(@PathVariable UUID courseId) {
    Course course = courseService.getCourseDetails(courseId);
    return ResponseEntity.ok(course);
}

// ✅ APRÈS (utilise DTO)
@GetMapping("/{courseId}")
public ResponseEntity<CourseDetails> getCourseDetails(@PathVariable UUID courseId) {
    Course course = courseService.getCourseDetails(courseId);
    return ResponseEntity.ok(CourseMapper.toDetails(course));
}
```

---

### Pattern 2: Endpoint de Liste Simple

```java
// ❌ AVANT
@GetMapping
public ResponseEntity<List<Course>> listCourses() {
    return ResponseEntity.ok(courseService.listAll());
}

// ✅ APRÈS
@GetMapping
public ResponseEntity<List<CourseSummary>> listCourses() {
    return ResponseEntity.ok(
        courseService.listAll()
            .stream()
            .map(CourseMapper::toSummary)
            .toList()
    );
}
```

---

### Pattern 3: Endpoint de Liste avec Pagination

```java
// ❌ AVANT
@GetMapping
public ResponseEntity<Page<Course>> listCourses(Pageable pageable) {
    Page<Course> page = courseService.listAll(pageable);
    return ResponseEntity.ok(page);
}

// ✅ APRÈS
@GetMapping
public ResponseEntity<Page<CourseSummary>> listCourses(Pageable pageable) {
    Page<Course> page = courseService.listAll(pageable);
    return ResponseEntity.ok(page.map(CourseMapper::toSummary));
}
```

---

### Pattern 4: Endpoint de Création (POST avec body)

```java
// ❌ AVANT
@PostMapping
public ResponseEntity<Course> createCourse(@RequestBody CreateCourseRequest req) {
    Course created = courseService.create(req.getCode(), req.getTitle(), ...);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
}

// ✅ APRÈS
@PostMapping
public ResponseEntity<CourseResponse> createCourse(@RequestBody CreateCourseRequest req) {
    Course created = courseService.create(
        req.getCode(), 
        req.getTitle(), 
        req.getDescription(),
        // ... autres champs
    );
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(CourseMapper.toResponse(created));
}
```

---

### Pattern 5: Endpoint de Mise à Jour (PUT)

```java
// ❌ AVANT
@PutMapping("/{courseId}")
public ResponseEntity<Course> updateCourse(
    @PathVariable UUID courseId,
    @RequestBody UpdateCourseRequest req
) {
    Course updated = courseService.update(courseId, req.getTitle(), ...);
    return ResponseEntity.ok(updated);
}

// ✅ APRÈS
@PutMapping("/{courseId}")
public ResponseEntity<CourseResponse> updateCourse(
    @PathVariable UUID courseId,
    @RequestBody UpdateCourseRequest req
) {
    Course updated = courseService.update(
        courseId, 
        req.getTitle(),
        req.getDescription(),
        // ... autres champs
    );
    return ResponseEntity.ok(CourseMapper.toResponse(updated));
}
```

---

### Pattern 6: Endpoint de Suppression (DELETE)

```java
// AVANT et APRÈS (pas de changement)
@DeleteMapping("/{courseId}")
public ResponseEntity<Void> deleteCourse(@PathVariable UUID courseId) {
    courseService.delete(courseId);
    return ResponseEntity.noContent().build();
}
```

---

## 📚 Exemples Complets par Entité

### StudentProfile Controller Complet

```java
package com.upf.backend.application.controller;

import com.upf.backend.application.dto.student.*;
import com.upf.backend.application.mapper.StudentMapper;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.Interfaces.IUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final IUserService userService;

    public UserController(IUserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<StudentProfileResponse> getCurrentUserProfile(
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        StudentProfile profile = userService.getCurrentUserProfile(currentUser.getProfileId());
        return ResponseEntity.ok(StudentMapper.toResponse(profile));
    }

    @PutMapping("/me")
    public ResponseEntity<StudentProfileResponse> updateMyProfile(
            @AuthenticationPrincipal SecurityUser currentUser,
            @RequestBody UpdateStudentProfileRequest request
    ) {
        StudentProfile updated = userService.updateProfile(
                currentUser.getProfileId(),
                request.bio(),
                request.profilePhotoUrl(),
                request.major(),
                request.currentYear(),
                request.profilePublic()
        );
        return ResponseEntity.ok(StudentMapper.toResponse(updated));
    }
}
```

---

### Course Controller Complet

```java
package com.upf.backend.application.controller;

import com.upf.backend.application.dto.announcement.AnnouncementResponse;
import com.upf.backend.application.dto.course.*;
import com.upf.backend.application.dto.courseresource.CourseResourceResponse;
import com.upf.backend.application.mapper.*;
import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.Interfaces.ICourseService;
import com.upf.backend.application.services.Interfaces.IProfessorService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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

    public CourseController(ICourseService courseService, IProfessorService professorService) {
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
        List<CourseSummary> summaries = courseService.getCoursesByMajor(major)
                .stream()
                .map(CourseMapper::toSummary)
                .toList();
        return ResponseEntity.ok(summaries);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me")
    public ResponseEntity<List<CourseSummary>> getMyCourses(Authentication auth) {
        UUID studentId = ((SecurityUser) auth.getPrincipal()).getProfileId();
        List<CourseSummary> summaries = courseService.getCoursesForStudent(studentId)
                .stream()
                .map(CourseMapper::toSummary)
                .toList();
        return ResponseEntity.ok(summaries);
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR', 'ADMIN')")
    @GetMapping("/{courseId}/announcements")
    public ResponseEntity<List<AnnouncementResponse>> getAnnouncements(
            @PathVariable UUID courseId
    ) {
        List<AnnouncementResponse> responses = professorService.getAnnouncementsByCourse(courseId)
                .stream()
                .map(AnnouncementMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR', 'ADMIN')")
    @GetMapping("/{courseId}/resources")
    public ResponseEntity<List<CourseResourceResponse>> getResources(
            @PathVariable UUID courseId
    ) {
        List<CourseResourceResponse> responses = courseService.getCourseDetails(courseId)
                .getResources()
                .stream()
                .map(CourseResourceMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    // Si vous avez des endpoints POST/PUT pour courses:

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseResponse> createCourse(
            @RequestBody CreateCourseRequest request
    ) {
        Course created = courseService.createCourse(
                request.getCode(),
                request.getTitle(),
                request.getDescription(),
                request.getMajor(),
                request.getYear(),
                request.getSemester(),
                request.getCredits(),
                request.getProfessorId()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CourseMapper.toResponse(created));
    }

    @PutMapping("/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable UUID courseId,
            @RequestBody UpdateCourseRequest request
    ) {
        Course updated = courseService.updateCourse(
                courseId,
                request.getTitle(),
                request.getDescription(),
                request.getObjectives(),
                request.getPrerequisites(),
                request.getCredits(),
                request.getIsActive()
        );
        return ResponseEntity.ok(CourseMapper.toResponse(updated));
    }
}
```

---

### Exam Controller - Changements Clés

```java
@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<ExamResponse> uploadExam(
         @AuthenticationPrincipal SecurityUser currentUser,
        @RequestParam UUID courseId,
        @RequestParam String subject,
        @RequestParam String academicYear,
        @RequestParam ExamType examType,
        @RequestParam(required = false) String description,
        @RequestPart("file") MultipartFile file
) throws IOException {
    byte[] content = file.getBytes();
    String fileHash = sha256(content);

    Exam created = examService.uploadExam(
            currentUser.getProfileId(),
            courseId,
            subject,
            academicYear,
            examType,
            description,
            file.getOriginalFilename(),
            FileType.fromContentType(file.getContentType()),
            file.getSize(),
            content,
            fileHash
    );

    // ✅ CHANGEMENT: Utiliser ExamMapper.toResponse()
    return ResponseEntity.status(201).body(ExamMapper.toResponse(created));
}

@GetMapping
public ResponseEntity<Page<ExamSummary>> listExams(
        @RequestParam(required = false) String subject,
        @RequestParam(required = false) String major,
        @RequestParam(required = false) Integer courseYear,
        @RequestParam(required = false) String academicYear,
        @RequestParam(required = false) ExamType examType,
        @RequestParam(required = false) UUID uploaderId,
        Pageable pageable
) {
    Page<Exam> page = examService.listExams(
            subject, major, courseYear, academicYear, examType, uploaderId, pageable
    );
    // ✅ CHANGEMENT: Mapper chaque Exam à ExamSummary
    return ResponseEntity.ok(page.map(ExamMapper::toSummary));
}

@GetMapping("/{examId}")
public ResponseEntity<ExamDetails> getExam(@PathVariable UUID examId) {
    Exam exam = examService.getExam(examId);
    // ✅ CHANGEMENT: Utiliser ExamMapper.toDetails()
    return ResponseEntity.ok(ExamMapper.toDetails(exam));
}

// Le download ne change pas (retourne Resource, pas une entité)
@GetMapping("/{examId}/download")
public ResponseEntity<Resource> downloadExam(@PathVariable UUID examId) {
    // ... pas de changement
}
```

---

### Admin Controller - Changements Clés

```java
@PostMapping("/bootstrap/initial")
public ResponseEntity<AdminProfileResponse> bootstrapInitialAdmin(
        @RequestBody CreateAdminRequest request
) {
    AdminProfile created = adminService.bootstrapInitialAdmin(
            request.getFirstName(),
            request.getLastName(),
            request.getEmail(),
            request.getPassword(),
            request.getAdminLevel()
    );
    // ✅ CHANGEMENT: AdminProfileResponse au lieu de AdminProfile
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(AdminMapper.toResponse(created));
}

@PostMapping("/accounts")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<AdminProfileResponse> createAdminAccount(
        @RequestBody CreateAdminRequest request
) {
    AdminProfile created = adminService.createAdminAccount(
            request.getFirstName(),
            request.getLastName(),
            request.getEmail(),
            request.getPassword(),
            request.getAdminLevel()
    );
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(AdminMapper.toResponse(created));
}

@GetMapping("/accounts")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<List<AdminProfileSummary>> listAdmins() {
    // ✅ CHANGEMENT: List<AdminProfileSummary> au lieu de List<AdminProfile>
    return ResponseEntity.ok(
        adminService.listAdmins()
            .stream()
            .map(AdminMapper::toSummary)
            .toList()
    );
}

@GetMapping("/students")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<List<StudentProfileSummary>> listStudents() {
    // ✅ CHANGEMENT: List<StudentProfileSummary> au lieu de List<StudentProfile>
    return ResponseEntity.ok(
        adminService.listStudents()
            .stream()
            .map(StudentMapper::toSummary)
            .toList()
    );
}

@PostMapping("/students/{studentId}/enroll/{courseId}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<EnrollmentResponse> enrollStudent(
        @PathVariable UUID studentId,
        @PathVariable UUID courseId
) {
    Enrollment enrollment = adminService.enrollStudentToCourse(studentId, courseId);
    // ✅ CHANGEMENT: EnrollmentResponse au lieu de Enrollment
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(EnrollmentMapper.toResponse(enrollment));
}
```

---

### Professor Controller - Changements Clés

```java
@GetMapping("/me/courses")
@PreAuthorize("hasRole('PROFESSOR')")
public ResponseEntity<List<CourseSummary>> getMyCourses(Authentication auth) {
    UUID profileId = ((SecurityUser) auth.getPrincipal()).getProfileId();
    // ✅ CHANGEMENT: List<CourseSummary> au lieu de List<Course>
    List<CourseSummary> summaries = professorService.getMyCourses(profileId)
            .stream()
            .map(CourseMapper::toSummary)
            .toList();
    if (summaries.isEmpty()) {
        return ResponseEntity.noContent().build();
    }
    return ResponseEntity.ok(summaries);
}

@PostMapping("/me/courses/{courseId}/resources")
@PreAuthorize("hasRole('PROFESSOR')")
public ResponseEntity<CourseResourceResponse> uploadResource(
        Authentication auth,
        @PathVariable UUID courseId,
        @RequestBody CreateCourseResourceRequest req
) {
    CourseResource resource = professorService.uploadResource(
            ((SecurityUser) auth.getPrincipal()).getProfileId(),
            courseId,
            req.getTitle(),
            req.getFileUrl(),
            req.getFileType(),
            req.getFileSizeBytes(),
            req.isExternal()
    );
    // ✅ CHANGEMENT: CourseResourceResponse au lieu de CourseResource
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(CourseResourceMapper.toResponse(resource));
}

@PostMapping("/me/courses/{courseId}/announcements")
@PreAuthorize("hasRole('PROFESSOR')")
public ResponseEntity<AnnouncementResponse> createAnnouncement(
        Authentication auth,
        @PathVariable UUID courseId,
        @RequestBody AnnouncementRequest req
) {
    Announcement announcement = professorService.createAnnouncement(
            ((SecurityUser) auth.getPrincipal()).getProfileId(),
            courseId,
            req.getTitle(),
            req.getContent()
    );
    // ✅ CHANGEMENT: AnnouncementResponse au lieu de Announcement
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(AnnouncementMapper.toResponse(announcement));
}
```

---

### Auth Controller - Changement Clé

```java
@PostMapping("/register")
public ResponseEntity<StudentProfileResponse> register(
        @RequestBody RegisterStudentRequest request
) {
    StudentProfile created = authService.registerStudent(
            request.firstName(),
            request.lastName(),
            request.email(),
            request.password(),
            request.major(),
            request.currentYear()
    );
    // ✅ CHANGEMENT: StudentProfileResponse au lieu de StudentProfile
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(StudentMapper.toResponse(created));
}

// Note: Les endpoints /login et /refresh restent inchangés (AuthTokens est déjà un DTO)
@PostMapping("/login")
public ResponseEntity<AuthTokens> login(@RequestBody LoginRequest request) {
    AuthTokens tokens = authService.authenticate(request.email(), request.password());
    return ResponseEntity.ok(tokens);
}

@PostMapping("/refresh")
public ResponseEntity<AuthTokens> refresh(@RequestBody RefreshTokenRequest request) {
    AuthTokens tokens = authService.refreshToken(request.refreshToken());
    return ResponseEntity.ok(tokens);
}
```

---

## 🔧 Imports Standard à Ajouter

```java
// DTOs
import com.upf.backend.application.dto.student.*;
import com.upf.backend.application.dto.professor.*;
import com.upf.backend.application.dto.admin.*;
import com.upf.backend.application.dto.course.*;
import com.upf.backend.application.dto.courseresource.*;
import com.upf.backend.application.dto.announcement.*;
import com.upf.backend.application.dto.enrollment.*;
import com.upf.backend.application.dto.exam.*;

// Mappers
import com.upf.backend.application.mapper.*;

// Entities
import com.upf.backend.application.model.entity.*;

// Spring
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
```

---

## ✅ Checklist Rapide

Pour chaque endpoint :

1. [ ] Vérifier le type de retour actuel (Entité JPA ?)
2. [ ] Remplacer par le DTO approprié
3. [ ] Importer le DTO et le Mapper
4. [ ] Appeler le mapper avant `return ResponseEntity.ok(...)`
5. [ ] Pour les listes: `.stream().map(Mapper::toXxx).toList()`
6. [ ] Pour les Pages: `.map(Mapper::toXxx)`
7. [ ] Compiler et tester

---

**Prêt à mettre à jour vos controllers !** 🚀
