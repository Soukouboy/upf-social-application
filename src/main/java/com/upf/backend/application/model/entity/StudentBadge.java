package  com.upf.backend.application.model.entity;
 

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Attribution d'un badge à un étudiant.
 *
 * Relations :
 * - Badge         → StudentBadge : composition (supprimé si le badge est supprimé)
 * - StudentProfile → StudentBadge : association simple
 *   (l'étudiant existe indépendamment, mais le lien disparaît si le profil est supprimé)
 *
 * Contrainte : un étudiant ne peut recevoir le même badge qu'une seule fois
 * → contrainte UNIQUE composite sur (student_profile_id, badge_id).
 *
 * context : décrit pourquoi le badge a été attribué (ex: "10 examens partagés en S1 2024").
 */
@Entity
@Table(name = "student_badges", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_profile_id", "badge_id"})
})
public class StudentBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * Association simple — le StudentProfile existe indépendamment.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    /**
     * Composition côté enfant — ce badge de référence doit exister.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @Column(name = "awarded_at", nullable = false, updatable = false)
    private LocalDateTime awardedAt;

    @Size(max = 300)
    @Column(name = "context", length = 300)
    private String context;

    @PrePersist
    protected void onCreate() { this.awardedAt = LocalDateTime.now(); }

    public StudentBadge() {}

    public StudentBadge(StudentProfile studentProfile, Badge badge, String context) {
        this.studentProfile = studentProfile;
        this.badge          = badge;
        this.context        = context;
    }

    public UUID getId() { return id; }
    public StudentProfile getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; }
    public Badge getBadge() { return badge; }
    public void setBadge(Badge badge) { this.badge = badge; }
    public LocalDateTime getAwardedAt() { return awardedAt; }
    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }
}
