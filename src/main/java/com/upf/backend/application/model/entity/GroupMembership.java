package  com.upf.backend.application.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.MembershipStatus;
import com.upf.backend.application.model.enums.RoleMember;

/**
 * Appartenance d'un étudiant à un groupe.
 *
 * Composition avec AcademicGroup : supprimé en cascade si le groupe est supprimé.
 * Association simple avec StudentProfile : l'étudiant existe indépendamment.
 *
 * Contrainte : un étudiant ne peut appartenir qu'une seule fois au même groupe
 * → contrainte UNIQUE composite sur (group_id, student_profile_id).
 */
@Entity
@Table(name = "group_memberships", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"group_id", "student_profile_id"})
})
public class GroupMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * Côté enfant de la composition AcademicGroup ↔ GroupMembership.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private AcademicGroup group;

    /**
     * Association simple — l'étudiant existe indépendamment du groupe.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 15)
    private RoleMember role ;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    private MembershipStatus status = MembershipStatus.ACTIVE;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    /**
     * Dernière lecture des messages du groupe — utile pour les badges "non lus".
     */
    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;

    @PrePersist
    protected void onCreate() { this.joinedAt = LocalDateTime.now(); }

    public GroupMembership() {}

    public GroupMembership(AcademicGroup group, StudentProfile studentProfile, RoleMember role) {
        this.group          = group;
        this.studentProfile = studentProfile;
        this.role           = role;
        this.status         = MembershipStatus.ACTIVE;
    }

    public GroupMembership(AcademicGroup group, StudentProfile studentProfile, RoleMember role, MembershipStatus status) {
        this.group          = group;
        this.studentProfile = studentProfile;
        this.role           = role;
        this.status         = status;
    }

    public UUID getId() { return id; }
    public AcademicGroup getGroup() { return group; }
    public void setGroup(AcademicGroup group) { this.group = group; }
    public StudentProfile getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; }
    public RoleMember getRole() { return role; }
    public void setRole(RoleMember role) { this.role = role; }
    public MembershipStatus getStatus() { return status; }
    public void setStatus(MembershipStatus status) { this.status = status; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public LocalDateTime getLastReadAt() { return lastReadAt; }
    public void setLastReadAt(LocalDateTime lastReadAt) { this.lastReadAt = lastReadAt; }
}
