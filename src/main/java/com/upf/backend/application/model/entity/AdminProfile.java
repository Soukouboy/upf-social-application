package  com.upf.backend.application.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.AdminLevel;

/**
 * Profil administrateur — données spécifiques à un utilisateur de rôle ADMIN ou MODERATOR.
 *
 * Relation avec User : composition (OneToOne).
 * Un AdminProfile ne peut pas exister sans son User propriétaire.
 */
@Entity
@Table(name = "admin_profiles")
public class AdminProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @NotNull(message = "Le niveau d'administration est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "admin_level", nullable = false, length = 20)
    private AdminLevel adminLevel;

    @Column(name = "last_action_at")
    private LocalDateTime lastActionAt;

    // -------------------------------------------------------------------------
    // Constructeurs
    // -------------------------------------------------------------------------

    public AdminProfile() {}

    public AdminProfile(User user, AdminLevel adminLevel) {
        this.user       = user;
        this.adminLevel = adminLevel;
    }

    // -------------------------------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------------------------------

    public UUID getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public AdminLevel getAdminLevel() { return adminLevel; }
    public void setAdminLevel(AdminLevel adminLevel) { this.adminLevel = adminLevel; }

    public LocalDateTime getLastActionAt() { return lastActionAt; }
    public void setLastActionAt(LocalDateTime lastActionAt) { this.lastActionAt = lastActionAt; }
}
