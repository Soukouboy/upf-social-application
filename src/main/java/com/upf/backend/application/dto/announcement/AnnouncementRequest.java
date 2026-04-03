package com.upf.backend.application.dto.announcement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Requête de création d'une annonce (POST /professors/me/courses/{id}/announcements).
 */
public class AnnouncementRequest {
    
    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 3, max = 500, message = "Le titre doit faire entre 3 et 500 caractères")
    private String title;

    @NotBlank(message = "Le contenu est obligatoire")
    @Size(min = 10, max = 5000, message = "Le contenu doit faire entre 10 et 5000 caractères")
    private String content;

    // Constructeurs
    public AnnouncementRequest() {}

    public AnnouncementRequest(String title, String content) {
        this.title = title;
        this.content = content;
    }

    // Getters / Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
