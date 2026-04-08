package com.upf.backend.application.services;

import com.upf.backend.application.model.enums.FileType;
import com.upf.backend.application.services.Exceptions.BusinessException;
import com.upf.backend.application.services.Interfaces.IFileStorageService;
import com.upf.backend.application.services.Interfaces.StoredFileDescriptor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    // ── Limites de taille ──────────────────────────────────────────────────────
    private static final long MAX_AVATAR_SIZE    = 5L  * 1024 * 1024;  // 5 Mo
    private static final long MAX_POST_IMAGE_SIZE = 10L * 1024 * 1024; // 10 Mo
    private static final long MAX_DOCUMENT_SIZE  = 20L * 1024 * 1024;  // 20 Mo
    private static final long MAX_EXAM_SIZE      = 20L * 1024 * 1024;  // 20 Mo

    // ── Types autorisés ────────────────────────────────────────────────────────
    private static final Set<String> IMAGE_TYPES    = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final Set<String> DOCUMENT_TYPES = Set.of("application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    private static final Set<String> EXAM_TYPES     = Set.of("application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/zip");

    // ── Noms des buckets Supabase ──────────────────────────────────────────────
    private static final String BUCKET_AVATARS   = "avatars";
    private static final String BUCKET_POSTS     = "posts";
    private static final String BUCKET_DOCUMENTS = "documents";
    private static final String BUCKET_EXAMS     = "exams";

    private final String supabaseUrl;
    private final String supabaseKey;
    private final RestTemplate restTemplate;

    public SupabaseStorageService(
            @Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.service-role-key}") String supabaseKey) {
        this.supabaseUrl  = supabaseUrl;
        this.supabaseKey  = supabaseKey;
        this.restTemplate = new RestTemplate();

        // LOG TEMPORAIRE — supprimer après vérification
    System.out.println("=== SUPABASE URL: " + supabaseUrl);
    System.out.println("=== SUPABASE KEY présente: " + 
        (supabaseKey != null && supabaseKey.startsWith("eyJ")));
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  MÉTHODES PUBLIQUES
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Upload d'une photo de profil (avatar).
     * Bucket : avatars (public)
     */
    public StoredFileDescriptor storeAvatar(MultipartFile file, String userId) {
        validateFile(file, MAX_AVATAR_SIZE, IMAGE_TYPES,
                "Avatar trop volumineux (max 5 Mo).",
                "Format d'avatar non autorisé (jpeg, png, webp, gif uniquement).");

        String folder = "user-" + userId;
        return upload(file, BUCKET_AVATARS, folder, true);
    }

    /**
     * Upload d'une image de post.
     * Bucket : posts (public)
     */
    public StoredFileDescriptor storePostImage(MultipartFile file, String postId) {
        validateFile(file, MAX_POST_IMAGE_SIZE, IMAGE_TYPES,
                "Image de post trop volumineuse (max 10 Mo).",
                "Format d'image non autorisé (jpeg, png, webp, gif uniquement).");

        String folder = "post-" + postId;
        return upload(file, BUCKET_POSTS, folder, true);
    }

    /**
     * Upload d'un document utilisateur (PDF, DOCX).
     * Bucket : documents (privé)
     */
    public StoredFileDescriptor storeDocument(MultipartFile file, String userId) {
        validateFile(file, MAX_DOCUMENT_SIZE, DOCUMENT_TYPES,
                "Document trop volumineux (max 20 Mo).",
                "Format de document non autorisé (PDF, DOCX uniquement).");

        String folder = "user-" + userId;
        return upload(file, BUCKET_DOCUMENTS, folder, false);
    }

    /**
     * Upload d'un sujet d'examen (PDF, DOCX, ZIP).
     * Bucket : exams (privé)
     */
    public StoredFileDescriptor storeExamFile(MultipartFile file, String examId) {
        validateFile(file, MAX_EXAM_SIZE, EXAM_TYPES,
                "Fichier d'examen trop volumineux (max 20 Mo).",
                "Format d'examen non autorisé (PDF, DOCX, ZIP uniquement).");

        String folder = "exam-" + examId;
        return upload(file, BUCKET_EXAMS, folder, false);
    }

    /**
     * Supprime un fichier dans Supabase Storage.
     */
    public void deleteFile(String bucket, String filePath) {
        String url = supabaseUrl + "/storage/v1/object/" + bucket + "/" + filePath;

        HttpHeaders headers = buildHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
        } catch (Exception e) {
            throw new BusinessException("Erreur lors de la suppression du fichier : " + e.getMessage());
        }
    }

    /**
     * Génère une URL signée temporaire pour un fichier privé.
     * @param expiresInSeconds durée de validité en secondes
     */
    public String generateSignedUrl(String bucket, String filePath, int expiresInSeconds) {
        String url = supabaseUrl + "/storage/v1/object/sign/" + bucket + "/" + filePath;

        HttpHeaders headers = buildHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String body = "{\"expiresIn\": " + expiresInSeconds + "}";
        HttpEntity<String> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<java.util.Map> response =
                    restTemplate.postForEntity(url, entity, java.util.Map.class);

            if (response.getBody() != null && response.getBody().containsKey("signedURL")) {
                return supabaseUrl + "/storage/v1" + response.getBody().get("signedURL");
            }
            throw new BusinessException("Impossible de générer une URL signée.");
        } catch (Exception e) {
            throw new BusinessException("Erreur URL signée : " + e.getMessage());
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  MÉTHODES PRIVÉES
    // ══════════════════════════════════════════════════════════════════════════

    private StoredFileDescriptor upload(MultipartFile file,
                                        String bucket,
                                        String folder,
                                        boolean isPublic) {
        try {
            String extension      = extractExtension(file.getOriginalFilename());
            String generatedName  = UUID.randomUUID() + extension;
            String storagePath    = folder + "/" + generatedName;

            String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + storagePath;

            HttpHeaders headers = buildHeaders();
            headers.setContentType(MediaType.parseMediaType(file.getContentType()));
            headers.set("x-upsert", "true"); // Écrase si même nom (utile pour les avatars)

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
            restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);

            String publicUrl = isPublic
                    ? buildPublicUrl(bucket, storagePath)
                    : null; // Pour les fichiers privés, utiliser generateSignedUrl()

            return new StoredFileDescriptor(
                    storagePath,
                    publicUrl,
                    file.getOriginalFilename(),
                    detectFileType(file.getContentType()),
                    file.getSize()
            );

        } catch (IOException e) {
            throw new BusinessException("Erreur lors de l'upload : " + e.getMessage());
        }
    }

    private void validateFile(MultipartFile file,
                               long maxSize,
                               Set<String> allowedMimeTypes,
                               String sizeErrorMsg,
                               String typeErrorMsg) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Le fichier est vide ou absent.");
        }
        if (file.getSize() > maxSize) {
            throw new BusinessException(sizeErrorMsg);
        }
        String contentType = file.getContentType();
        if (contentType == null || !allowedMimeTypes.contains(contentType)) {
            throw new BusinessException(typeErrorMsg);
        }
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseKey);
        headers.set("Authorization", "Bearer " + supabaseKey);
        return headers;
    }

    private String buildPublicUrl(String bucket, String storagePath) {
        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + storagePath;
    }

    private String extractExtension(String filename) {
        if (filename == null) return "";
        int index = filename.lastIndexOf('.');
        return (index >= 0 && index < filename.length() - 1)
                ? filename.substring(index)
                : "";
    }

    private FileType detectFileType(String mimeType) {
        if (mimeType == null) return FileType.PDF; // fallback
        return switch (mimeType) {
            case "image/jpeg", "image/png", "image/webp", "image/gif" -> FileType.IMAGE;
            case "application/pdf"                                      -> FileType.PDF;
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document" -> FileType.DOCX;
            case "application/zip"                                      -> FileType.ZIP;
            default -> throw new BusinessException("Type MIME non reconnu : " + mimeType);
        };
    }

    // ── Méthodes de l'interface non applicables en mode cloud ─────────────────

    // @Override
    // public StoredFileDescriptor storeExamFile(String originalFilename, FileType contentType,
    //                                            long size, byte[] content) {
    //     throw new UnsupportedOperationException("Utilisez storeExamFile(MultipartFile, examId)");
    // }

    // @Override
    // public StoredFileDescriptor storeCourseResource(String originalFilename, FileType contentType,
    //                                                  long size, byte[] content) {
    //     throw new UnsupportedOperationException("Utilisez storeDocument(MultipartFile, userId)");
    // }

    // @Override
    // public Resource loadAsResource(String relativePath) {
    //     throw new UnsupportedOperationException("Utilisez generateSignedUrl() pour les fichiers privés.");
    // }

    // @Override
    // public String generatePublicUrl(String relativePath) {
    //     throw new UnsupportedOperationException("L'URL est retournée directement par upload().");
    // }
}