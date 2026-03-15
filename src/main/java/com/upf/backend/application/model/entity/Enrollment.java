package  com.upf.backend.application.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.EnrollmentStatus;

/**
 * Table de jointure entre StudentProfile et Course.
 * Représente l'inscription d'un étudiant à un cours.
 *
 * Relations :
 * - StudentProfile → Enrollment : association simple (unidirectionnelle depuis Enrollment)
 * - Course        → Enrollment : association simple (unidirectionnelle depuis Enrollment)
 * Aucun des deux parents n'est propriétaire exclusif → pas de composition.
 *
 * Contrainte : un étudiant ne peut s'inscrire qu'une seule fois au même cours
 * → contrainte UNIQUE composite sur (student_profile_id, course_id).
 *
 * Sécurité : le statut contrôle l'accès aux ressources du cours côté service.
 */
@Entity
@Table(name = "enrollments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_profile_id", "course_id"})
})
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "enrolled_at", nullable = false, updatable = false)
    private LocalDateTime enrolledAt;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    // -------------------------------------------------------------------------
    // Lifecycle
    // -------------------------------------------------------------------------

    @PrePersist
    protected void onCreate() {
        this.enrolledAt = LocalDateTime.now();
    }

    // -------------------------------------------------------------------------
    // Constructeurs
    // -------------------------------------------------------------------------

    public Enrollment() {}

    public Enrollment(StudentProfile studentProfile, Course course) {
        this.studentProfile = studentProfile;
        this.course         = course;
        this.status         = EnrollmentStatus.ACTIVE;
    }

    // -------------------------------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------------------------------

    public UUID getId() { return id; }

    public StudentProfile getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public LocalDateTime getEnrolledAt() { return enrolledAt; }

    public EnrollmentStatus getStatus() { return status; }
    public void setStatus(EnrollmentStatus status) { this.status = status; }
}
