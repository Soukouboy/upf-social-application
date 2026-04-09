package com.upf.backend.application.dto.course;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/**
 * Requête de mise à jour d'un cours (PUT /courses/{id}).
 */
public class UpdateCourseRequest {
    
    @Size(max = 200, message = "Le titre ne peut pas dépasser 200 caractères")
    private String title;

    @Size(max = 2000, message = "La description ne peut pas dépasser 2000 caractères")
    private String description;

    @Size(max = 1000, message = "Les objectifs ne peuvent pas dépasser 1000 caractères")
    private String objectives;

    @Size(max = 1000, message = "Les prérequis ne peuvent pas dépasser 1000 caractères")
    private String prerequisites;

    @Min(value = 0, message = "Les crédits ne peuvent pas être négatifs")
    private Integer credits;

    private Boolean isActive;

    // Constructeurs
    public UpdateCourseRequest() {}

    // Getters / Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getObjectives() { return objectives; }
    public void setObjectives(String objectives) { this.objectives = objectives; }

    public String getPrerequisites() { return prerequisites; }
    public void setPrerequisites(String prerequisites) { this.prerequisites = prerequisites; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
