package com.upf.backend.application.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.UserRole;

/**
 * Entité centrale d'authentification.
 * Elle ne contient que les informations communes à tous les utilisateurs.
 * Les données spécifiques sont dans StudentProfile ou AdminProfile (composition).
 *
 * Sécurité :
 * - email unique + non nul → empêche les doublons de compte
 * - passwordHash non nul → jamais de compte sans mot de passe
 * - role contrôlé par enum → impossible d'injecter un rôle invalide
 */
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "Le mot de passe hashé est obligatoire")
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @NotNull(message = "Le rôle est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 80)
    @Column(name = "first_name", nullable = false, length = 80)
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 80)
    @Column(name = "last_name", nullable = false, length = 80)
    private String lastName;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // -------------------------------------------------------------------------
    // Lifecycle
    // -------------------------------------------------------------------------

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // -------------------------------------------------------------------------
    // Constructeurs
    // -------------------------------------------------------------------------

    public User() {}

    public User(String email, String passwordHash, UserRole role,
                String firstName, String lastName) {
        this.email        = email;
        this.passwordHash = passwordHash;
        this.role         = role;
        this.firstName    = firstName;
        this.lastName     = lastName;
    }

    // -------------------------------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------------------------------

    public UUID getId() { return id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
