package  com.upf.backend.application.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.ContextMessage;
import com.upf.backend.application.model.enums.MessageType;

/**
 * Message envoyé dans un groupe ou en privé entre deux étudiants.
 *
 * Discriminant : le champ 'context' détermine si le message est GROUP ou PRIVATE.
 *
 * Règle de cohérence (CHECK en BDD + validation @PrePersist) :
 * - context = GROUP   → groupId non nul, recipientId nul
 * - context = PRIVATE → recipientId non nul, groupId nul
 *
 * Composition avec AcademicGroup (pour les messages GROUP) :
 * - supprimé en cascade si le groupe est supprimé.
 * Pour les messages PRIVATE, groupId est null et group est null.
 *
 * senderId et recipientId sont des UUID bruts (références légères)
 * pour éviter un couplage fort vers StudentProfile.
 */
@Entity
@Table(
        name = "messages",
        // Contrainte CHECK MySQL pour garantir la cohérence du discriminant
        indexes = {
                @Index(name = "idx_message_group_id",    columnList = "group_id"),
                @Index(name = "idx_message_sender_id",   columnList = "sender_id"),
                @Index(name = "idx_message_recipient_id",columnList = "recipient_id")
        }
)
public class Messages {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * Discriminant : GROUP ou PRIVATE.
     * Détermine lequel de groupId / recipientId est utilisé.
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "context", nullable = false, length = 10)
    private ContextMessage context;

    /**
     * Composition avec AcademicGroup.
     * Nullable car null si context = PRIVATE.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private AcademicGroup group;

    /**
     * UUID de l'expéditeur (StudentProfile) — référence légère.
     */
    @NotNull
    @Column(name = "sender_id", nullable = false)
    private UUID senderId;

    /**
     * UUID du destinataire (StudentProfile) — nullable si context = GROUP.
     */
    @Column(name = "recipient_id")
    private UUID recipientId;

    @Size(max = 4000)
    @Column(name = "content", length = 4000)
    private String content;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false, length = 10)
    private MessageType messageType = MessageType.TEXT;

    // Champs fichier — nullables si messageType = TEXT
    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "file_name", length = 200)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    /**
     * UUID du message auquel on répond — nullable.
     */
    @Column(name = "reply_to_id")
    private UUID replyToId;

    @Column(name = "is_edited", nullable = false)
    private boolean isEdited = false;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // -------------------------------------------------------------------------
    // Lifecycle + validation du discriminant
    // -------------------------------------------------------------------------

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        validateContext();
    }

    @PreUpdate
    protected void onUpdate() {
        validateContext();
    }

    /**
     * Garantit la cohérence entre context, groupId et recipientId.
     * Cette validation s'ajoute à la contrainte CHECK en base.
     */
    private void validateContext() {
        if (this.context == ContextMessage.GROUP) {
            if (this.group == null) {
                throw new IllegalStateException("Un message GROUP doit avoir un groupId.");
            }
            if (this.recipientId != null) {
                throw new IllegalStateException("Un message GROUP ne doit pas avoir de recipientId.");
            }
        } else if (this.context == ContextMessage.PRIVATE) {
            if (this.recipientId == null) {
                throw new IllegalStateException("Un message PRIVATE doit avoir un recipientId.");
            }
            if (this.group != null) {
                throw new IllegalStateException("Un message PRIVATE ne doit pas avoir de groupId.");
            }
        }
    }

    // -------------------------------------------------------------------------
    // Constructeurs
    // -------------------------------------------------------------------------

    public Messages() {}

    /** Constructeur pour message de groupe */
    public Messages(AcademicGroup group, UUID senderId, String content, MessageType messageType) {
        this.context     = ContextMessage.GROUP;
        this.group       = group;
        this.senderId    = senderId;
        this.content     = content;
        this.messageType = messageType;
    }

    /** Constructeur pour message privé */
    public Messages(UUID senderId, UUID recipientId, String content, MessageType messageType) {
        this.context     = ContextMessage.PRIVATE;
        this.senderId    = senderId;
        this.recipientId = recipientId;
        this.content     = content;
        this.messageType = messageType;
    }

    // -------------------------------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------------------------------

    public UUID getId() { return id; }

    public ContextMessage getContext() { return context; }
    public void setContext(ContextMessage context) { this.context = context; }

    public AcademicGroup getGroup() { return group; }
    public void setGroup(AcademicGroup group) { this.group = group; }

    public UUID getSenderId() { return senderId; }
    public void setSenderId(UUID senderId) { this.senderId = senderId; }

    public UUID getRecipientId() { return recipientId; }
    public void setRecipientId(UUID recipientId) { this.recipientId = recipientId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public MessageType getMessageType() { return messageType; }
    public void setMessageType(MessageType messageType) { this.messageType = messageType; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public UUID getReplyToId() { return replyToId; }
    public void setReplyToId(UUID replyToId) { this.replyToId = replyToId; }

    public boolean isEdited() { return isEdited; }
    public void setEdited(boolean edited) { isEdited = edited; }

    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }

    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
