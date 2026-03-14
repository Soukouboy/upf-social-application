package  com.upf.backend.application.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Profil étudiant — données spécifiques à un utilisateur de rôle STUDENT.
 *
 * Relation avec User : composition (OneToOne, CascadeType.ALL + orphanRemoval).
 * Un StudentProfile ne peut pas exister sans son User propriétaire.
 *
 * Relation avec StudentBadge : association simple unidirectionnelle depuis StudentBadge
 * (l'étudiant ne porte pas la liste de ses badges ici pour limiter le couplage).
 */
@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * Propriétaire de ce profil.
     * Côté propriétaire de la relation OneToOne (clé étrangère ici).
     */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;

    @NotBlank(message = "La biographie ne peut pas être vide si renseignée")
    @Size(max = 500)
    @Column(name = "bio", length = 500)
    private String bio;

    @NotBlank(message = "La filière est obligatoire")
    @Size(max = 100)
    @Column(name = "major", nullable = false, length = 100)
    private String major;

    @Min(value = 1, message = "L'année d'études doit être au moins 1")
    @Max(value = 7, message = "L'année d'études ne peut pas dépasser 7")
    @Column(name = "current_year", nullable = false)
    private int currentYear;

    @Column(name = "is_profile_public", nullable = false)
    private boolean isProfilePublic = true;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    // -------------------------------------------------------------------------
    // Constructeurs
    // -------------------------------------------------------------------------

    public StudentProfile() {}

    public StudentProfile(User user, String major, int currentYear) {
        this.user        = user;
        this.major       = major;
        this.currentYear = currentYear;
    }

    // -------------------------------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------------------------------

    public UUID getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }

    public int getCurrentYear() { return currentYear; }
    public void setCurrentYear(int currentYear) { this.currentYear = currentYear; }

    public boolean isProfilePublic() { return isProfilePublic; }
    public void setProfilePublic(boolean profilePublic) { isProfilePublic = profilePublic; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
}
