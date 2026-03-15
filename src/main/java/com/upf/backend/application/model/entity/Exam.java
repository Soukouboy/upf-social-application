package  com.upf.backend.application.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.upf.backend.application.model.enums.ExamType;

/**
 * Épreuve partagée par un étudiant sur la plateforme.
 *
 * Relations :
 * - StudentProfile → Exam : association simple (l'exam survit à la suppression du profil)
 * - Course         → Exam : association simple (même logique)
 * - Exam → ExamReport     : composition (un rapport n'existe pas sans l'épreuve)
 * - Exam → ExamComment    : composition (idem)
 * - Exam → ExamVote       : composition (idem)
 *
 * Suppression en cascade des entités filles via orphanRemoval.
 *
 * Note : isReported et reportCount ont été supprimés car redondants
 * avec la table ExamReport (calculables dynamiquement).
 */
@Entity
@Table(name = "exams")
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * Association simple — l'uploader peut être supprimé sans supprimer l'épreuve.
     * uploaderId stocké comme UUID brut pour découpler davantage si besoin.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploader_id", nullable = false)
    private StudentProfile uploader;

    /**
     * Association simple — le cours peut être modifié indépendamment.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 200)
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Size(max = 1000)
    @Column(name = "description", length = 1000)
    private String description;

    @NotBlank(message = "L'année académique est obligatoire")
    @Size(max = 20)
    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;

    @NotNull(message = "Le type d'épreuve est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "exam_type", nullable = false, length = 20)
    private ExamType examType;

    @Column(name = "exam_date")
    private LocalDate examDate;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    /**
     * Hash MD5/SHA du fichier — permet de détecter les doublons côté service.
     */
    @Column(name = "file_hash", length = 64)
    private String fileHash;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "download_count", nullable = false)
    private int downloadCount = 0;

    @Column(name = "upvote_count", nullable = false)
    private int upvoteCount = 0;

    @Column(name = "downvote_count", nullable = false)
    private int downvoteCount = 0;

    @Column(name = "is_hidden", nullable = false)
    private boolean isHidden = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // -------------------------------------------------------------------------
    // Compositions (enfants supprimés si l'épreuve est supprimée)
    // -------------------------------------------------------------------------

    @OneToMany(
            mappedBy     = "exam",
            cascade      = CascadeType.ALL,
            orphanRemoval = true,
            fetch        = FetchType.LAZY
    )
    private List<ExamReport> reports = new ArrayList<>();

    @OneToMany(
            mappedBy     = "exam",
            cascade      = CascadeType.ALL,
            orphanRemoval = true,
            fetch        = FetchType.LAZY
    )
    private List<ExamComment> comments = new ArrayList<>();

    @OneToMany(
            mappedBy     = "exam",
            cascade      = CascadeType.ALL,
            orphanRemoval = true,
            fetch        = FetchType.LAZY
    )
    private List<ExamVote> votes = new ArrayList<>();

    // -------------------------------------------------------------------------
    // Lifecycle
    // -------------------------------------------------------------------------

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // -------------------------------------------------------------------------
    // Constructeurs
    // -------------------------------------------------------------------------

    public Exam() {}

    public Exam(StudentProfile uploader, Course course,
                String title, String academicYear, ExamType examType) {
        this.uploader     = uploader;
        this.course       = course;
        this.title        = title;
        this.academicYear = academicYear;
        this.examType     = examType;
    }

    // -------------------------------------------------------------------------
    // Helpers composition
    // -------------------------------------------------------------------------

    public void addReport(ExamReport report) {
        reports.add(report);
        report.setExam(this);
    }

    public void addComment(ExamComment comment) {
        comments.add(comment);
        comment.setExam(this);
    }

    public void addVote(ExamVote vote) {
        votes.add(vote);
        vote.setExam(this);
    }

    // -------------------------------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------------------------------

    public UUID getId() { return id; }

    public StudentProfile getUploader() { return uploader; }
    public void setUploader(StudentProfile uploader) { this.uploader = uploader; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public ExamType getExamType() { return examType; }
    public void setExamType(ExamType examType) { this.examType = examType; }

    public LocalDate getExamDate() { return examDate; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileHash() { return fileHash; }
    public void setFileHash(String fileHash) { this.fileHash = fileHash; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public int getDownloadCount() { return downloadCount; }
    public void setDownloadCount(int downloadCount) { this.downloadCount = downloadCount; }

    public int getUpvoteCount() { return upvoteCount; }
    public void setUpvoteCount(int upvoteCount) { this.upvoteCount = upvoteCount; }

    public int getDownvoteCount() { return downvoteCount; }
    public void setDownvoteCount(int downvoteCount) { this.downvoteCount = downvoteCount; }

    public boolean isHidden() { return isHidden; }
    public void setHidden(boolean hidden) { isHidden = hidden; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public List<ExamReport> getReports() { return reports; }
    public List<ExamComment> getComments() { return comments; }
    public List<ExamVote> getVotes() { return votes; }
}
