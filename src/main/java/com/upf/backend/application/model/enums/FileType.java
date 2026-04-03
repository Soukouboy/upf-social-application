package com.upf.backend.application.model.enums;

public enum FileType {
    PDF,
    IMAGE,
    ZIP,
    DOCX,
    PPT,
    LINK;

    /**
     * Convertit le contentType HTTP (MIME type) en FileType enum.
     * Exemple : "application/pdf" → FileType.PDF
     */
    public static FileType fromContentType(String contentType) {
        if (contentType == null) {
            throw new IllegalArgumentException("Le type du fichier est introuvable.");
        }

        return switch (contentType.toLowerCase()) {
            case "application/pdf"                                                  -> PDF;
            case "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp" -> IMAGE;
            case "application/zip", "application/x-zip-compressed"                 -> ZIP;
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                 "application/msword"                                               -> DOCX;
            case "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                 "application/vnd.ms-powerpoint"                                            -> PPT;
            case "text/uri-list", "text/plain" -> LINK;     
            default -> throw new IllegalArgumentException(
                "Type de fichier non supporté : " + contentType
            );
        };
    }
}