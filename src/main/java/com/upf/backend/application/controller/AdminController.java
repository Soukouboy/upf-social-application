package com.upf.backend.application.controller;

import com.upf.backend.application.controller.request.CreateAdminRequest;
import com.upf.backend.application.controller.request.PromoteStudentRequest;
import com.upf.backend.application.controller.request.UpdateAdminLevelRequest;
import com.upf.backend.application.model.entity.AdminProfile;
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
    public ResponseEntity<AdminProfile> bootstrapInitialAdmin(
            @RequestBody CreateAdminRequest request
    ) {
        AdminProfile created = adminService.bootstrapInitialAdmin(
                request.email(),
                request.password(),
                request.adminLevel()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Création explicite d'un compte admin/modérateur.
     * Réservé à un admin existant.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/accounts")
    public ResponseEntity<AdminProfile> createAdminAccount(
            @RequestBody CreateAdminRequest request
    ) {
        AdminProfile created = adminService.createAdminAccount(
                request.email(),
                request.password(),
                request.adminLevel()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Promotion d'un étudiant existant en admin/modérateur.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/students/{studentId}/promote")
    public ResponseEntity<AdminProfile> promoteStudentToAdmin(
            @PathVariable UUID studentId,
            @RequestBody PromoteStudentRequest request
    ) {
        AdminProfile created = adminService.promoteStudentToAdmin(
                studentId,
                request.adminLevel()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/accounts")
    public ResponseEntity<List<AdminProfile>> listAdmins() {
        return ResponseEntity.ok(adminService.listAdmins());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/accounts/{adminProfileId}")
    public ResponseEntity<AdminProfile> getAdminProfile(
            @PathVariable UUID adminProfileId
    ) {
        return ResponseEntity.ok(adminService.getAdminProfile(adminProfileId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/accounts/{adminProfileId}/level")
    public ResponseEntity<AdminProfile> updateAdminLevel(
            @PathVariable UUID adminProfileId,
            @RequestBody UpdateAdminLevelRequest request
    ) {
        AdminProfile updated = adminService.updateAdminLevel(
                adminProfileId,
                request.adminLevel()
        );
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/accounts/{adminProfileId}")
    public ResponseEntity<Void> revokeAdminRights(
            @PathVariable UUID adminProfileId
    ) {
        adminService.revokeAdminRights(adminProfileId);
        return ResponseEntity.noContent().build();
    }
}