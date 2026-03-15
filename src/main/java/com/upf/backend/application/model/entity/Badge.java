package  com.upf.backend.application.model.entity;

 

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Définition d'un badge de gamification.
 *
 * Un badge est une entité de référentiel (comme un catalogue).
 * Il existe indépendamment des étudiants qui le reçoivent.
 *
 * Composition avec StudentBadge :
 * - Si un Badge est supprimé, tous les StudentBadge associés sont supprimés en cascade.
 *
 * Le champ 'criteria' stocke en JSON les conditions d'attribution
 * (ex: {"type":"EXAM_COUNT","threshold":10}).
 * Côté service, une logique dédiée évalue ces critères.
 */
@Entity
@Table(name = "badges")
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotBlank
    @Size(max = 50)
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @NotBlank
    @Size(max = 100)
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    /**
     * Critères d'attribution stockés en JSON.
     * Exemple : {"type":"UPVOTE_COUNT","threshold":50}
     */
    @Column(name = "criteria", columnDefinition = "JSON")
    private String criteria;

    public Badge() {}

    public Badge(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public UUID getId() { return id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIconUrl() { return iconUrl; }
    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }
    public String getCriteria() { return criteria; }
    public void setCriteria(String criteria) { this.criteria = criteria; }
}
