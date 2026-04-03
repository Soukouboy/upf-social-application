package com.upf.backend.application.dto.courseresource;

import com.upf.backend.application.model.enums.FileType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Requête de création/upload d'une ressource (POST /professors/me/courses/{id}/resources).
 */
public class CreateCourseResourceRequest {
    
    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 2, max = 200, message = "Le titre doit faire entre 2 et 200 caractères")
    private String title;

    @NotBlank(message = "L'URL du fichier est obligatoire")
    @Size(min = 10, max = 500, message = "L'URL doit faire entre 10 et 500 caractères")
    private String fileUrl;

    @NotNull(message = "Le type de fichier est obligatoire")
    private FileType fileType;

    private Long fileSizeBytes;

    private boolean isExternal = false;

    // Constructeurs
    public CreateCourseResourceRequest() {}

    public CreateCourseResourceRequest(String title, String fileUrl, FileType fileType) {
        this.title = title;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
    }

    // Getters / Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public FileType getFileType() { return fileType; }
    public void setFileType(FileType fileType) { this.fileType = fileType; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public boolean isExternal() { return isExternal; }
    public void setExternal(boolean external) { isExternal = external; }
}
