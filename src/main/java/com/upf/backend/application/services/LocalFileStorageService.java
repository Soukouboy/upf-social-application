package com.upf.backend.application.services;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.upf.backend.application.services.Exceptions.BusinessException;
import com.upf.backend.application.services.Exceptions.ResourceNotFoundException;
import com.upf.backend.application.services.Interfaces.IFileStorageService;
import com.upf.backend.application.services.Interfaces.StoredFileDescriptor;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class LocalFileStorageService implements IFileStorageService {

    private static final long MAX_EXAM_FILE_SIZE = 20L * 1024 * 1024;       // 20 Mo
    private static final long MAX_COURSE_RESOURCE_SIZE = 50L * 1024 * 1024; // 50 Mo

    private static final Set<String> EXAM_ALLOWED_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/png",
            "image/jpeg"
    );

    private final Path rootPath;
    private final String publicBaseUrl;

    public LocalFileStorageService(
            @Value("${app.storage.root:uploads}") String storageRoot,
            @Value("${app.storage.public-base-url:/files}") String publicBaseUrl) {
        this.rootPath = Paths.get(storageRoot).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl;
        initDirectories();
    }

    @Override
    public StoredFileDescriptor storeExamFile(String originalFilename,
                                              String contentType,
                                              long size,
                                              byte[] content) {
        validateFilename(originalFilename);
        validateContent(content);
        validateSize(size, MAX_EXAM_FILE_SIZE, "Le fichier d'épreuve dépasse la taille maximale de 20 Mo.");
        validateContentType(contentType, EXAM_ALLOWED_TYPES, "Type de fichier d'épreuve non autorisé.");

        return store("exams", originalFilename, contentType, size, content);
    }

    @Override
    public StoredFileDescriptor storeCourseResource(String originalFilename,
                                                    String contentType,
                                                    long size,
                                                    byte[] content) {
        validateFilename(originalFilename);
        validateContent(content);
        validateSize(size, MAX_COURSE_RESOURCE_SIZE, "La ressource de cours dépasse la taille maximale de 50 Mo.");

        return store("course-resources", originalFilename, contentType, size, content);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadAsResource(String relativePath) {
        try {
            Path filePath = rootPath.resolve(relativePath).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Fichier introuvable ou illisible.");
            }

            return resource;
        } catch (MalformedURLException e) {
            throw new BusinessException("Chemin de fichier invalide : " + relativePath);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public String generatePublicUrl(String relativePath) {
        String normalized = relativePath.replace("\\", "/");
        if (publicBaseUrl.endsWith("/")) {
            return publicBaseUrl + normalized;
        }
        return publicBaseUrl + "/" + normalized;
    }

    private StoredFileDescriptor store(String folder,
                                       String originalFilename,
                                       String contentType,
                                       long size,
                                       byte[] content) {
        try {
            String extension = extractExtension(originalFilename);
            String generatedFilename = UUID.randomUUID() + extension;

            Path targetFolder = rootPath.resolve(folder);
            Files.createDirectories(targetFolder);

            Path targetFile = targetFolder.resolve(generatedFilename);
            Files.write(targetFile, content, StandardOpenOption.CREATE_NEW);

            String relativePath = folder + "/" + generatedFilename;
            String publicUrl = generatePublicUrl(relativePath);

            return new StoredFileDescriptor(
                    relativePath,
                    publicUrl,
                    originalFilename,
                    contentType,
                    size
            );
        } catch (IOException e) {
            throw new BusinessException("Erreur lors du stockage du fichier : " + e.getMessage());
        }
    }

    private void initDirectories() {
        try {
            Files.createDirectories(rootPath.resolve("exams"));
            Files.createDirectories(rootPath.resolve("course-resources"));
        } catch (IOException e) {
            throw new BusinessException("Impossible d'initialiser le stockage local : " + e.getMessage());
        }
    }

    private void validateFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new BusinessException("Le nom du fichier est obligatoire.");
        }
    }

    private void validateContent(byte[] content) {
        if (content == null || content.length == 0) {
            throw new BusinessException("Le contenu du fichier est vide.");
        }
    }

    private void validateSize(long size, long maxSize, String message) {
        if (size <= 0) {
            throw new BusinessException("La taille du fichier doit être positive.");
        }
        if (size > maxSize) {
            throw new BusinessException(message);
        }
    }

    private void validateContentType(String contentType,
                                     Set<String> allowedTypes,
                                     String message) {
        if (contentType == null || contentType.isBlank()) {
            throw new BusinessException("Le type MIME du fichier est obligatoire.");
        }
        if (!allowedTypes.contains(contentType)) {
            throw new BusinessException(message);
        }
    }

    private String extractExtension(String originalFilename) {
        int index = originalFilename.lastIndexOf('.');
        if (index < 0 || index == originalFilename.length() - 1) {
            return "";
        }
        return originalFilename.substring(index);
    }
}