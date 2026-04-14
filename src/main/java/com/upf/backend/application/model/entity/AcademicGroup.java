package com.upf.backend.application.model.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.upf.backend.application.model.enums.GroupType;
import com.upf.backend.application.model.enums.Major;

/**
 * Groupe de discussion académique.
 *
 * Compositions :
 * - Group → GroupMembership : supprimé en cascade (un membership n'existe pas sans groupe)
 * - Group → Message         : supprimé en cascade (un message de groupe n'existe pas sans groupe)
 *
 * createdBy stocke l'UUID du StudentProfile créateur en tant que référence légère
 * (pas de @ManyToOne ici pour garder un couplage faible).
 */
@Entity
@Table(name = "groups")
public class AcademicGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotBlank(message = "Le nom du groupe est obligatoire")
    @Size(max = 100)
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Size(max = 500)
    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl="https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 10)
    private GroupType type;

    @Size(max = 100)
    @Column(name = "major", length = 100)
    private Major major;

    /**
     * UUID du StudentProfile créateur — référence légère, pas de FK JPA.
     */
    @NotNull
    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "member_count", nullable = false)
    private int memberCount = 0;

    @Column(name = "message_count", nullable = false)
    private int messageCount = 0;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // -------------------------------------------------------------------------
    // Compositions
    // -------------------------------------------------------------------------

    @OneToMany(
            mappedBy      = "group",
            cascade       = CascadeType.ALL,
            orphanRemoval = true,
            fetch         = FetchType.LAZY
    )
    private List<GroupMembership> memberships = new ArrayList<>();

    @OneToMany(
            mappedBy      = "group",
            cascade       = CascadeType.ALL,
            orphanRemoval = true,
            fetch         = FetchType.LAZY
    )
    private List<Messages> messages = new ArrayList<>();

    // -------------------------------------------------------------------------
    // Lifecycle
    // -------------------------------------------------------------------------

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    // -------------------------------------------------------------------------
    // Constructeurs
    // -------------------------------------------------------------------------

    public AcademicGroup() {}

    public AcademicGroup(String name, GroupType type, UUID createdBy) {
        this.name      = name;
        this.type      = type;
        this.createdBy = createdBy;
    }

    // -------------------------------------------------------------------------
    // Helpers composition
    // -------------------------------------------------------------------------

    public void addMembership(GroupMembership membership) {
        memberships.add(membership);
        membership.setGroup(this);
        this.memberCount++;
    }

    public void removeMembership(GroupMembership membership) {
        memberships.remove(membership);
        membership.setGroup(null);
        this.memberCount = Math.max(0, this.memberCount - 1);
    }

    public void addMessage(Messages message) {
        messages.add(message);
        message.setGroup(this);
        this.messageCount++;
    }

    // -------------------------------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------------------------------

    public UUID getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }

    public GroupType getType() { return type; }
    public void setType(GroupType type) { this.type = type; }

    public Major getMajor() { return major; }
    public void setMajor(Major major) { this.major = major; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public int getMemberCount() { return memberCount; }
    public void setMemberCount(int memberCount) { this.memberCount = memberCount; }

    public int getMessageCount() { return messageCount; }
    public void setMessageCount(int messageCount) { this.messageCount = messageCount; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public List<GroupMembership> getMemberships() { return memberships; }
    public List<Messages> getMessages() { return messages; }
}
