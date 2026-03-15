package  com.upf.backend.application.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.VoteType;

/**
 * Vote (upvote/downvote) d'un étudiant sur une épreuve.
 *
 * Composition avec Exam : supprimé en cascade si l'épreuve est supprimée.
 * Association simple avec StudentProfile.
 *
 * Contrainte : un étudiant ne peut voter qu'une seule fois par épreuve
 * → contrainte UNIQUE composite sur (exam_id, student_id).
 */
@Entity
@Table(name = "exam_votes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"exam_id", "student_id"})
})
public class ExamVote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "vote_type", nullable = false, length = 10)
    private VoteType voteType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    public ExamVote() {}

    public ExamVote(Exam exam, StudentProfile student, VoteType voteType) {
        this.exam      = exam;
        this.student   = student;
        this.voteType  = voteType;
    }

    public UUID getId() { return id; }
    public Exam getExam() { return exam; }
    public void setExam(Exam exam) { this.exam = exam; }
    public StudentProfile getStudent() { return student; }
    public void setStudent(StudentProfile student) { this.student = student; }
    public VoteType getVoteType() { return voteType; }
    public void setVoteType(VoteType voteType) { this.voteType = voteType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
