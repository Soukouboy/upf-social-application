package  com.upf.backend.application.model.entity;

 
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Commentaire posté sur une épreuve.
 *
 * Composition avec Exam : supprimé en cascade si l'épreuve est supprimée.
 * Association simple avec StudentProfile (l'auteur).
 */
@Entity
@Table(name = "exam_comments")
public class ExamComment {

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
    @JoinColumn(name = "author_id", nullable = false)
    private StudentProfile author;

    @NotBlank(message = "Le contenu du commentaire est obligatoire")
    @Size(max = 2000)
    @Column(name = "content", nullable = false, length = 2000)
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    public ExamComment() {}

    public ExamComment(Exam exam, StudentProfile author, String content) {
        this.exam    = exam;
        this.author  = author;
        this.content = content;
    }

    public UUID getId() { return id; }
    public Exam getExam() { return exam; }
    public void setExam(Exam exam) { this.exam = exam; }
    public StudentProfile getAuthor() { return author; }
    public void setAuthor(StudentProfile author) { this.author = author; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
