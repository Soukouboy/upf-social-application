package  com.upf.backend.application.model.entity;
 
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.upf.backend.application.model.enums.Major;

/**
 * Cours disponible sur la plateforme.
 *
 * Composition avec CourseResource :
 * - Un CourseResource n'existe pas sans son Course → CascadeType.ALL + orphanRemoval = true.
 *
 * Association simple avec Exam et Enrollment :
 * - Ces entités référencent Course mais existent de manière plus autonome.
 * - Les collections inverses ne sont PAS déclarées ici (faible couplage).
 */
@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotBlank(message = "Le code du cours est obligatoire")
    @Size(max = 20)
    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;

    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 200)
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Size(max = 2000)
    @Column(name = "description", length = 2000)
    private String description;

    @Size(max = 1000)
    @Column(name = "objectives", length = 1000)
    private String objectives="À définir";

    @Size(max = 1000)
    @Column(name = "prerequisites", length = 1000)
    private String prerequisites="À définir";

    @NotNull(message = "La filière est obligatoire")
    @Size(max = 100)
    @Column(name = "major", nullable = false, length = 100)
    // Après
    @Enumerated(EnumType.STRING)
    private Major major;

    @Min(1) @Max(7)
    @Column(name = "year", nullable = false)
    private int year=3;

    @Min(1) @Max(2)
    @Column(name = "semester", nullable = false)
    private int semester;

    @Min(0)
    @Column(name = "credits")
    private int credits;

    @NotBlank(message = "Le nom de l'enseignant est obligatoire")
    @Size(max = 150)
    @Column(name = "instructor_name", nullable = false, length = 150)
    private String instructorName;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


        // ✅ Ajouter — relation vers le vrai professeur
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id")
    private ProfessorProfile professor;

 
    // ✅ Ajouter — annonces du cours
    @OneToMany(
        mappedBy = "course",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<Announcement> announcements = new ArrayList<>();

    // Getters/Setters à ajouter
    public ProfessorProfile getProfessor() { return professor; }
    public void setProfessor(ProfessorProfile professor) { this.professor = professor; }

   
    public List<Announcement> getAnnouncements() { return announcements; }


    /**
     * Composition : les ressources appartiennent au cours.
     * Suppression en cascade si le cours est supprimé.
     */
    @OneToMany(
            mappedBy = "course",
            cascade  = CascadeType.ALL,
            orphanRemoval = true,
            fetch    = FetchType.LAZY
    )
    private List<CourseResource> resources = new ArrayList<>();

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

    public Course() {}

    public Course(String code, String title, Major major,
                  int year, int semester, String instructorName) {
        this.code           = code;
        this.title          = title;
        this.major          = major;
        this.year           = year;
        this.semester       = semester;
        this.instructorName = instructorName;
    }

    // -------------------------------------------------------------------------
    // Helper pour la composition
    // -------------------------------------------------------------------------

    public void addResource(CourseResource resource) {
        resources.add(resource);
        resource.setCourse(this);
    }

    public void removeResource(CourseResource resource) {
        resources.remove(resource);
        resource.setCourse(null);
    }

    // -------------------------------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------------------------------

    public UUID getId() { return id; }

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

    public Major getMajor() { return major; }
    public void setMajor(Major major) { this.major = major; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }

    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public List<CourseResource> getResources() { return resources; }
}
