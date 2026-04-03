package  com.upf.backend.application.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.NotificationStatus;
import com.upf.backend.application.model.enums.NotificationType;

/**
 * Notification envoyée à un utilisateur.
 *
 * Association simple avec User (le destinataire).
 * Une notification peut subsister un certain temps après la suppression de l'entité liée
 * → pas de composition, relatedEntityId est un UUID brut.
 */
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * Destinataire — association simple unidirectionnelle.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private NotificationType type;


        @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private NotificationStatus status = NotificationStatus.PENDING;

    public NotificationStatus getStatus() {
            return status;
        }

    public void setId(UUID id) {
            this.id = id;
        }

        public void setStatus(NotificationStatus status) {
            this.status = status;
        }
    @NotBlank
    @Size(max = 150)
    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Size(max = 500)
    @Column(name = "content", length = 500)
    private String content;

    /**
     * Type de l'entité liée (ex: "EXAM", "GROUP", "MESSAGE") — contexte de la notif.
     */
    @Size(max = 50)
    @Column(name = "related_entity_type", length = 50)
    private String relatedEntityType;

    /**
     * UUID de l'entité liée — référence légère pour navigation dans l'UI.
     */
    @Column(name = "related_entity_id")
    private UUID relatedEntityId;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Date d'expiration — après cette date, la notification peut être archivée.
     */
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    public Notification() {}

    public Notification(User recipient, NotificationType type, String title) {
        this.recipient = recipient;
        this.type      = type;
        this.title     = title;
    }

    public UUID getId() { return id; }
    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getRelatedEntityType() { return relatedEntityType; }
    public void setRelatedEntityType(String relatedEntityType) { this.relatedEntityType = relatedEntityType; }
    public UUID getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(UUID relatedEntityId) { this.relatedEntityId = relatedEntityId; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public void markAsSent() {
        this.status = NotificationStatus.SENT;
    }

     public void markAsFailed() {
        this.status = NotificationStatus.FAILED;
    }
    
}
