/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * GUIDE COMPLET : Mise à jour des Controllers pour utiliser les DTOs
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * Ce document montre comment mettre à jour chaque endpoint des controllers
 * pour utiliser les DTOs générés et éviter la récursion JSON.
 *
 * STRUCTURE :
 * 1. AdminController
 * 2. UserController
 * 3. CourseController
 * 4. ProfessorController
 * 5. ExamController
 * 6. AuthController
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// 1. ADMIN CONTROLLER - Mises à jour requises
// ═══════════════════════════════════════════════════════════════════════════════════

/*
AVANT (expose les entités JPA directement - PROBLÈME):
    @PostMapping("/bootstrap/initial")
    public ResponseEntity<AdminProfile> bootstrapInitialAdmin(@RequestBody CreateAdminRequest request) {
        AdminProfile created = adminService.bootstrapInitialAdmin(...);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

APRÈS (utilise AdminProfileResponse - CORRIGÉ):
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
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AdminMapper.toResponse(created));
    }

TOUS LES ENDPOINTS AdminController:

1. @PostMapping("/bootstrap/initial")
   Avant: ResponseEntity<AdminProfile> bootstrapInitialAdmin(...)
   Après: ResponseEntity<AdminProfileResponse> bootstrapInitialAdmin(...)
   Mapper: AdminMapper.toResponse(created)

2. @PostMapping("/accounts")
   Avant: ResponseEntity<AdminProfile> createAdminAccount(...)
   Après: ResponseEntity<AdminProfileResponse> createAdminAccount(...)
   Mapper: AdminMapper.toResponse(created)

3. @PostMapping("/students/{studentId}/promote")
   Avant: ResponseEntity<AdminProfile> promoteStudentToAdmin(...)
   Après: ResponseEntity<AdminProfileResponse> promoteStudentToAdmin(...)
   Mapper: AdminMapper.toResponse(created)

4. @GetMapping("/accounts")
   Avant: ResponseEntity<List<AdminProfile>> listAdmins()
   Après: ResponseEntity<List<AdminProfileSummary>> listAdmins()
   Mapper: adminService.listAdmins().stream().map(AdminMapper::toSummary).toList()

5. @GetMapping("/accounts/{adminProfileId}")
   Avant: ResponseEntity<AdminProfile> getAdminProfile(...)
   Après: ResponseEntity<AdminProfileResponse> getAdminProfile(...)
   Mapper: AdminMapper.toResponse(adminService.getAdminProfile(adminProfileId))

6. @PutMapping("/accounts/{adminProfileId}/level")
   Avant: ResponseEntity<AdminProfile> updateAdminLevel(...)
   Après: ResponseEntity<AdminProfileResponse> updateAdminLevel(...)
   Mapper: AdminMapper.toResponse(updated)

7. @DeleteMapping("/accounts/{adminProfileId}")
   Avant: ResponseEntity<Void> revokeAdminRights(...)
   Après: ResponseEntity<Void> revokeAdminRights(...)
   (pas de changement de retour)

8. @PostMapping("/professors")
   Avant: ResponseEntity<ProfessorProfile> createProfessor(...)
   Après: ResponseEntity<ProfessorProfileResponse> createProfessor(...)
   Mapper: ProfessorMapper.toResponse(created)

9. @PutMapping("/professors/{professorId}/courses/{courseId}")
   Avant: ResponseEntity<ProfessorProfile> assignCourse(...)
   Après: ResponseEntity<ProfessorProfileResponse> assignCourse(...)
   Mapper: ProfessorMapper.toResponse(adminService.assignCourseToProfessor(...))

10. @GetMapping("/students")
    Avant: ResponseEntity<List<StudentProfile>> listStudents()
    Après: ResponseEntity<List<StudentProfileSummary>> listStudents()
    Mapper: adminService.listStudents().stream().map(StudentMapper::toSummary).toList()

11. @PostMapping("/students/{studentId}/enroll/{courseId}")
    Avant: ResponseEntity<Enrollment> enrollStudent(...)
    Après: ResponseEntity<EnrollmentResponse> enrollStudent(...)
    Mapper: EnrollmentMapper.toResponse(adminService.enrollStudentToCourse(...))

12. @DeleteMapping("/students/{studentId}/enroll/{courseId}")
    Avant: ResponseEntity<Void> unenrollStudent(...)
    Après: ResponseEntity<Void> unenrollStudent(...)
    (pas de changement de retour)
*/

// ═══════════════════════════════════════════════════════════════════════════════════
// 2. USER CONTROLLER - Mises à jour requises
// ═══════════════════════════════════════════════════════════════════════════════════

/*
1. @GetMapping("/me")
   Avant: ResponseEntity<StudentProfile> getCurrentUserProfile(...)
   Après: ResponseEntity<StudentProfileResponse> getCurrentUserProfile(...)
   Mapper: StudentMapper.toResponse(profile)

2. @PutMapping("/me")
   Avant: ResponseEntity<StudentProfile> updateMyProfile(...)
   Après: ResponseEntity<StudentProfileResponse> updateMyProfile(...)
   Mapper: StudentMapper.toResponse(updated)

CODE COMPLET CORRIGÉ:

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
*/

// ═══════════════════════════════════════════════════════════════════════════════════
// 3. COURSE CONTROLLER - Mises à jour requises
// ═══════════════════════════════════════════════════════════════════════════════════

/*
1. @GetMapping
   Avant: ResponseEntity<Page<Course>> listCourses(...)
   Après: ResponseEntity<Page<CourseSummary>> listCourses(...)
   Mapper: page.map(CourseMapper::toSummary)

2. @GetMapping("/{courseId}")
   Avant: ResponseEntity<Course> getCourseDetails(...)
   Après: ResponseEntity<CourseDetails> getCourseDetails(...)
   Mapper: CourseMapper.toDetails(course)

3. @GetMapping("/major/{major}")
   Avant: ResponseEntity<List<Course>> getByMajor(...)
   Après: ResponseEntity<List<CourseSummary>> getByMajor(...)
   Mapper: courseService.getCoursesByMajor(major).stream().map(CourseMapper::toSummary).toList()

4. @GetMapping("/me")
   Avant: ResponseEntity<List<Course>> getMyCourses(...)
   Après: ResponseEntity<List<CourseSummary>> getMyCourses(...)
   Mapper: courseService.getCoursesForStudent(studentId).stream().map(CourseMapper::toSummary).toList()

5. @GetMapping("/{courseId}/announcements")
   Avant: ResponseEntity<List<Announcement>> getAnnouncements(...)
   Après: ResponseEntity<List<AnnouncementResponse>> getAnnouncements(...)
   Mapper: professorService.getAnnouncementsByCourse(courseId).stream().map(AnnouncementMapper::toResponse).toList()

6. @GetMapping("/{courseId}/resources")
   Avant: ResponseEntity<List<CourseResource>> getResources(...)
   Après: ResponseEntity<List<CourseResourceResponse>> getResources(...)
   Mapper: courseService.getCourseDetails(courseId).getResources().stream().map(CourseResourceMapper::toResponse).toList()

CODE COMPLET CORRIGÉ:

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
    public ResponseEntity<List<AnnouncementResponse>> getAnnouncements(@PathVariable UUID courseId) {
        List<AnnouncementResponse> responses = professorService.getAnnouncementsByCourse(courseId)
                .stream()
                .map(AnnouncementMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

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
*/

// ═══════════════════════════════════════════════════════════════════════════════════
// 4. PROFESSOR CONTROLLER - Mises à jour requises
// ═══════════════════════════════════════════════════════════════════════════════════

/*
1. @GetMapping("/me/courses")
   Avant: ResponseEntity<List<Course>> getMyCourses(...)
   Après: ResponseEntity<List<CourseSummary>> getMyCourses(...)
   Mapper: professorService.getMyCourses(profileId).stream().map(CourseMapper::toSummary).toList()

2. @GetMapping("/me/courses/{courseId}/students")
   Avant: ResponseEntity<List<StudentProfile>> getStudents(...)
   Après: ResponseEntity<List<StudentProfileSummary>> getStudents(...)
   Mapper: professorService.getStudentsInCourse(...).stream().map(StudentMapper::toSummary).toList()

3. @PostMapping("/me/courses/{courseId}/resources")
   Avant: ResponseEntity<CourseResource> uploadResource(...)
   Après: ResponseEntity<CourseResourceResponse> uploadResource(...)
   Mapper: CourseResourceMapper.toResponse(resource)

4. @PostMapping("/me/courses/{courseId}/announcements")
   Avant: ResponseEntity<Announcement> createAnnouncement(...)
   Après: ResponseEntity<AnnouncementResponse> createAnnouncement(...)
   Mapper: AnnouncementMapper.toResponse(announcement)

5. @DeleteMapping("/me/announcements/{announcementId}")
   Avant: ResponseEntity<Void> deleteAnnouncement(...)
   Après: ResponseEntity<Void> deleteAnnouncement(...)
   (pas de changement)

CODE COMPLET CORRIGÉ:

@RestController
@RequestMapping("/professors")
@PreAuthorize("hasRole('PROFESSOR')")
public class ProfessorController {
    private final IProfessorService professorService;

    public ProfessorController(IProfessorService professorService) {
        this.professorService = professorService;
    }

    @GetMapping("/me/courses")
    public ResponseEntity<List<CourseSummary>> getMyCourses(Authentication auth) {
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

    @GetMapping("/me/courses/{courseId}/students")
    public ResponseEntity<List<StudentProfileSummary>> getStudents(
            Authentication auth,
            @PathVariable UUID courseId
    ) {
        List<StudentProfileSummary> summaries = professorService.getStudentsInCourse(profileId(auth), courseId)
                .stream()
                .map(StudentMapper::toSummary)
                .toList();
        return ResponseEntity.ok(summaries);
    }

    @PostMapping("/me/courses/{courseId}/resources")
    public ResponseEntity<CourseResourceResponse> uploadResource(
            Authentication auth,
            @PathVariable UUID courseId,
            @RequestBody CreateCourseResourceRequest req
    ) {
        CourseResource resource = professorService.uploadResource(
                profileId(auth), courseId,
                req.getTitle(), req.getFileUrl(),
                req.getFileType(), req.getFileSizeBytes(),
                req.isExternal()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(CourseResourceMapper.toResponse(resource));
    }

    @PostMapping("/me/courses/{courseId}/announcements")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            Authentication auth,
            @PathVariable UUID courseId,
            @RequestBody AnnouncementRequest req
    ) {
        Announcement announcement = professorService.createAnnouncement(
                profileId(auth), courseId, req.getTitle(), req.getContent()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(AnnouncementMapper.toResponse(announcement));
    }

    @DeleteMapping("/me/announcements/{announcementId}")
    public ResponseEntity<Void> deleteAnnouncement(
            Authentication auth,
            @PathVariable UUID announcementId
    ) {
        professorService.deleteAnnouncement(profileId(auth), announcementId);
        return ResponseEntity.noContent().build();
    }

    private UUID profileId(Authentication auth) {
        return ((SecurityUser) auth.getPrincipal()).getProfileId();
    }
}
*/

// ═══════════════════════════════════════════════════════════════════════════════════
// 5. EXAM CONTROLLER - Mises à jour requises
// ═══════════════════════════════════════════════════════════════════════════════════

/*
1. @PostMapping("/upload")
   Avant: ResponseEntity<Exam> uploadExam(...)
   Après: ResponseEntity<ExamResponse> uploadExam(...)
   Mapper: ExamMapper.toResponse(created)

2. @GetMapping
   Avant: ResponseEntity<Page<Exam>> listExams(...)
   Après: ResponseEntity<Page<ExamSummary>> listExams(...)
   Mapper: page.map(ExamMapper::toSummary)

3. @GetMapping("/{examId}")
   Avant: ResponseEntity<Exam> getExam(...)
   Après: ResponseEntity<ExamDetails> getExam(...)
   Mapper: ExamMapper.toDetails(exam)

4. @GetMapping("/{examId}/download")
   Avant: ResponseEntity<Resource> downloadExam(...)
   Après: ResponseEntity<Resource> downloadExam(...)
   (pas de changement - retourne un Resource, pas une entité)

CODE CORRIGÉ POUR LES CHANGES:

@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<ExamResponse> uploadExam(...) throws IOException {
    // ... logique existante ...
    Exam created = examService.uploadExam(...);
    return ResponseEntity.status(201).body(ExamMapper.toResponse(created));
}

@GetMapping("/listExams")
public ResponseEntity<Page<ExamSummary>> listExams(...) {
    Page<Exam> page = examService.listExams(...);
    return ResponseEntity.ok(page.map(ExamMapper::toSummary));
}

@GetMapping("/{examId}")
public ResponseEntity<ExamDetails> getExam(@PathVariable UUID examId) {
    Exam exam = examService.getExam(examId);
    return ResponseEntity.ok(ExamMapper.toDetails(exam));
}
*/

// ═══════════════════════════════════════════════════════════════════════════════════
// 6. AUTH CONTROLLER - Mises à jour requises
// ═══════════════════════════════════════════════════════════════════════════════════

/*
1. @PostMapping("/register")
   Avant: ResponseEntity<StudentProfile> register(...)
   Après: ResponseEntity<StudentProfileResponse> register(...)
   Mapper: StudentMapper.toResponse(created)

CODE CORRIGÉ:

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final IAuthService authService;

    public AuthController(IAuthService authService) {
        this.authService = authService;
    }

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
        return ResponseEntity.status(HttpStatus.CREATED).body(StudentMapper.toResponse(created));
    }

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
}

NOTE: Les endpoints /login et /refresh retournent toujours AuthTokens car c'est un DTO spécialisé
pour l'authentification, pas une entité JPA.
*/

// ═══════════════════════════════════════════════════════════════════════════════════
// RÉSUMÉ : CHECKLIST DES CHANGEMENTS
// ═══════════════════════════════════════════════════════════════════════════════════

/*
ÉTAPE 1: Importer les DTOs et Mappers dans chaque Controller
    import com.upf.backend.application.dto.*;
    import com.upf.backend.application.mapper.*;

ÉTAPE 2: Pour CHAQUE endpoint, vérifier le type de retour actuel
    - Si c'est une entité JPA (StudentProfile, Course, etc.) : DOIT ÊTRE CHANGÉ
    - Si c'est déjà un DTO (AuthTokens) : PAS DE CHANGEMENT REQUIS
    - Si c'est un Resource (download) : PAS DE CHANGEMENT REQUIS

ÉTAPE 3: Remplacer le type de retour par le DTO approprié
    - Pour détail: Entité → EntityResponse
    - Pour listes: Entité → EntitySummary
    - Pour création/mise à jour: Entité → EntityResponse

ÉTAPE 4: Appeler le mapper approprié avant de retourner
    Avant: return ResponseEntity.ok(entity);
    Après: return ResponseEntity.ok(SomeMapper.toResponse(entity));

ÉTAPE 5: Si c'est une liste, appliquer le mapper en stream
    Avant: return ResponseEntity.ok(list);
    Après: return ResponseEntity.ok(list.stream().map(SomeMapper::toSummary).toList());

ÉTAPE 6: Si c'est une Page, utiliser page.map(...)
    Avant: return ResponseEntity.ok(page);
    Après: return ResponseEntity.ok(page.map(SomeMapper::toSummary));

RÉSULTAT FINAL:
✓ Pas de récursion JSON infi nie
✓ Pas de données sensibles exposées (passwordHash)
✓ Couplage décuplé entre couche API et couche persistance
✓ API REST cohérente et documentée
*/
