package com.upf.backend.application.controller;

import com.upf.backend.application.controller.request.CreateAdminRequest;
import com.upf.backend.application.controller.request.CreateProfessorRequest;
import com.upf.backend.application.controller.request.PromoteStudentRequest;
import com.upf.backend.application.controller.request.UpdateAdminLevelRequest;
import com.upf.backend.application.dto.admin.AdminProfileResponse;
import com.upf.backend.application.dto.enrollment.EnrollmentResponse;
import com.upf.backend.application.dto.professor.ProfessorProfileResponse;
import com.upf.backend.application.dto.student.StudentProfileSummary;
import com.upf.backend.application.mapper.AdminMapper;
import com.upf.backend.application.mapper.EnrollmentMapper;
import com.upf.backend.application.mapper.ProfessorMapper;
import com.upf.backend.application.mapper.StudentMapper;
import com.upf.backend.application.model.entity.AdminProfile;
import com.upf.backend.application.model.entity.Enrollment;
import com.upf.backend.application.model.entity.ProfessorProfile;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.Interfaces.IAdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final IAdminService adminService;

    public AdminController(IAdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * Endpoint public, utilisable uniquement si aucun admin n'existe encore.
     */
    @PostMapping("/bootstrap/initial")
    public ResponseEntity<AdminProfileResponse> bootstrapInitialAdmin(
            @RequestBody CreateAdminRequest request
    ) {
        AdminProfile created = adminService.bootstrapInitialAdmin(
                request.firstName(),
                request.lastName(),
                request.email(),
                request.password(),
                request.adminLevel()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(AdminMapper.toResponse(created));
    }

    /**
     * Création explicite d'un compte admin/modérateur.
     * Réservé à un admin existant.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/accounts")
    public ResponseEntity<AdminProfileResponse> createAdminAccount(
            @RequestBody CreateAdminRequest request
    ) {
        AdminProfile created = adminService.createAdminAccount(
                request.firstName(),
                request.lastName(),
                request.email(),
                request.password(),
                request.adminLevel()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(AdminMapper.toResponse(created));
    }

    /**
     * Promotion d'un étudiant existant en admin/modérateur.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/students/{studentId}/promote")
    public ResponseEntity<AdminProfileResponse> promoteStudentToAdmin(
            @PathVariable UUID studentId,
            @RequestBody PromoteStudentRequest request
    ) {
        AdminProfile created = adminService.promoteStudentToAdmin(
                studentId,
                request.adminLevel()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(AdminMapper.toResponse(created));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/accounts")
    public ResponseEntity<List<AdminProfileResponse>> listAdmins() {
        return ResponseEntity.ok(adminService.listAdmins().stream()
                .map(AdminMapper::toResponse)
                .toList());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/accounts/{adminProfileId}")
    public ResponseEntity<AdminProfileResponse> getAdminProfile(
            @PathVariable UUID adminProfileId
    ) {
        return ResponseEntity.ok(AdminMapper.toResponse(adminService.getAdminProfile(adminProfileId)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/accounts/{adminProfileId}/level")
    public ResponseEntity<AdminProfileResponse> updateAdminLevel(
            @PathVariable UUID adminProfileId,
            @RequestBody UpdateAdminLevelRequest request
    ) {
        AdminProfile updated = adminService.updateAdminLevel(
                adminProfileId,
                request.adminLevel()
        );
        return ResponseEntity.ok(AdminMapper.toResponse(updated));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/accounts/{adminProfileId}")
    public ResponseEntity<Void> revokeAdminRights(
            @PathVariable UUID adminProfileId
    ) {
        adminService.revokeAdminRights(adminProfileId);
        return ResponseEntity.noContent().build();
    }

      // ─── Professeurs ───────────────
      @PostMapping("/professors")
    public ResponseEntity<ProfessorProfileResponse> createProfessor(
            @RequestBody CreateProfessorRequest request) {

       
           ProfessorProfile created = adminService.createProfessorAccount(
                request.firstName(), request.lastName(),
                request.email(), request.password(),
                request.department(), request.title(),
                request.courseIds());
        return ResponseEntity.status(HttpStatus.CREATED).body(ProfessorMapper.toResponse(created));

            }

              @PutMapping("/professors/{professorId}/courses/{courseId}")
    public ResponseEntity<ProfessorProfileResponse> assignCourse(@PathVariable UUID professorId,
                                                          @PathVariable UUID courseId) {
        return ResponseEntity.ok(ProfessorMapper.toResponse(adminService.assignCourseToProfessor(professorId, courseId)));
    }

 // ─── Étudiants ───────────────────────────────────────────────────────────

    @GetMapping("/students")
    public ResponseEntity<List<StudentProfileSummary>> listStudents() {
    
        return ResponseEntity.ok(adminService.listStudents().stream()
                .map(StudentMapper::toSummary)
                .toList());
    }

    @PostMapping("/students/{studentId}/enroll/{courseId}")
    public ResponseEntity<EnrollmentResponse> enrollStudent(@PathVariable UUID studentId,
                                                     @PathVariable UUID courseId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
            EnrollmentMapper.toResponse(adminService.enrollStudentToCourse(studentId, courseId)));
    }

    @DeleteMapping("/students/{studentId}/enroll/{courseId}")
    public ResponseEntity<Void> unenrollStudent(@PathVariable UUID studentId,
                                                 @PathVariable UUID courseId) {
        adminService.unenrollStudentFromCourse(studentId, courseId);
        return ResponseEntity.noContent().build();
    }

}