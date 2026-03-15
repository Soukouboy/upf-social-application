package  com.upf.backend.application.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.ReportReason;
import com.upf.backend.application.model.enums.ReportStatus;

/**
 * Signalement d'une épreuve par un étudiant.
 *
 * Composition avec Exam : supprimé en cascade si l'épreuve est supprimée.
 * Association simple avec StudentProfile (le signaleur et le modérateur).
 */
@Entity
@Table(name = "exam_reports")
public class ExamReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    /**
     * L'étudiant qui a signalé — association simple (non propriétaire).
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reported_by", nullable = false)
    private StudentProfile reportedBy;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false, length = 20)
    private ReportReason reason;

    @Size(max = 500)
    @Column(name = "details", length = 500)
    private String details;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReportStatus status = ReportStatus.PENDING;

    /**
     * UUID de l'admin/modérateur qui a traité le signalement — nullable tant que PENDING.
     */
    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    public ExamReport() {}

    public ExamReport(Exam exam, StudentProfile reportedBy, ReportReason reason) {
        this.exam       = exam;
        this.reportedBy = reportedBy;
        this.reason     = reason;
    }

    public UUID getId() { return id; }
    public Exam getExam() { return exam; }
    public void setExam(Exam exam) { this.exam = exam; }
    public StudentProfile getReportedBy() { return reportedBy; }
    public void setReportedBy(StudentProfile reportedBy) { this.reportedBy = reportedBy; }
    public ReportReason getReason() { return reason; }
    public void setReason(ReportReason reason) { this.reason = reason; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }
    public UUID getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(UUID reviewedBy) { this.reviewedBy = reviewedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
