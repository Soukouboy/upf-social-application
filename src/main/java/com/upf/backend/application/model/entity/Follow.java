package  com.upf.backend.application.model.entity;

 
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Relation de suivi entre deux étudiants (follower → following).
 *
 * Relation réflexive sur StudentProfile :
 * - follower  : celui qui suit
 * - following : celui qui est suivi
 *
 * Contrainte métier importante :
 * - Un étudiant ne peut pas se suivre lui-même → CHECK en BDD + validation applicative.
 * - Le couple (followerId, followingId) doit être unique → contrainte UNIQUE composite.
 *
 * Relations : deux associations simples unidirectionnelles vers StudentProfile.
 * Follow n'appartient à aucun des deux profils de manière exclusive → pas de composition.
 */
@Entity
@Table(name = "follows", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"follower_id", "following_id"})
})
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * L'étudiant qui initie le suivi.
     * Association simple — un Follow ne "possède" pas un StudentProfile.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "follower_id", nullable = false)
    private StudentProfile follower;

    /**
     * L'étudiant qui est suivi.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "following_id", nullable = false)
    private StudentProfile following;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // -------------------------------------------------------------------------
    // Lifecycle
    // -------------------------------------------------------------------------

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        // Contrainte applicative : un étudiant ne peut pas se suivre lui-même
        if (this.follower != null && this.following != null &&
                this.follower.getId().equals(this.following.getId())) {
            throw new IllegalStateException("Un étudiant ne peut pas se suivre lui-même.");
        }
    }

    // -------------------------------------------------------------------------
    // Constructeurs
    // -------------------------------------------------------------------------

    public Follow() {}

    public Follow(StudentProfile follower, StudentProfile following) {
        this.follower  = follower;
        this.following = following;
    }

    // -------------------------------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------------------------------

    public UUID getId() { return id; }

    public StudentProfile getFollower() { return follower; }
    public void setFollower(StudentProfile follower) { this.follower = follower; }

    public StudentProfile getFollowing() { return following; }
    public void setFollowing(StudentProfile following) { this.following = following; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
