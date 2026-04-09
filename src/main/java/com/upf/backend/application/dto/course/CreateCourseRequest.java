package com.upf.backend.application.dto.course;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

/**
 * Requête de création d'un cours (POST /admin/courses).
 */
public class CreateCourseRequest {
    
    @NotBlank(message = "Le code du cours est obligatoire")
    @Size(min = 2, max = 20, message = "Le code doit faire entre 2 et 20 caractères")
    private String code;

    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 3, max = 200, message = "Le titre doit faire entre 3 et 200 caractères")
    private String title;

    @Size(max = 2000, message = "La description ne peut pas dépasser 2000 caractères")
    private String description;

    @Size(max = 1000, message = "Les objectifs ne peuvent pas dépasser 1000 caractères")
    private String objectives;

    @Size(max = 1000, message = "Les prérequis ne peuvent pas dépasser 1000 caractères")
    private String prerequisites;

    @NotBlank(message = "La filière est obligatoire")
    @Size(min = 2, max = 100, message = "La filière doit faire entre 2 et 100 caractères")
    private String major;

    @Min(value = 1, message = "L'année doit être entre 1 et 7")
    @Max(value = 7, message = "L'année doit être entre 1 et 7")
    private int year;

    @Min(value = 1, message = "Le semestre doit être 1 ou 2")
    @Max(value = 2, message = "Le semestre doit être 1 ou 2")
    private int semester;

    @Min(value = 0, message = "Les crédits ne peuvent pas être négatifs")
    private int credits;

    private UUID professorId;

    // Constructeurs
    public CreateCourseRequest() {}

    public CreateCourseRequest(String code, String title, String major, int year, 
                              int semester, UUID professorId) {
        this.code = code;
        this.title = title;
        this.major = major;
        this.year = year;
        this.semester = semester;
        this.professorId = professorId;
    }

    // Getters / Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getObjectives() { return objectives; }
    public void setObjectives(String objectives) { this.objectives = objectives; }

    public String getPrerequisites() { return prerequisites; }
    public void setPrerequisites(String prerequisites) { this.prerequisites = prerequisites; }

    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }

    public UUID getProfessorId() { return professorId; }
    public void setProfessorId(UUID professorId) { this.professorId = professorId; }
}
