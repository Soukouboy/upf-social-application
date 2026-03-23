package com.upf.backend.application.controller;

import com.upf.backend.application.model.entity.Exam;
import com.upf.backend.application.model.enums.ExamType;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.ExamService;
import com.upf.backend.application.services.Interfaces.IFileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@RestController
@RequestMapping("/exams")
public class ExamController {

    private final ExamService examService;
    private final IFileStorageService fileStorageService;

    public ExamController(ExamService examService,
                          IFileStorageService fileStorageService) {
        this.examService = examService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Exam> uploadExam(
             @AuthenticationPrincipal SecurityUser currentUser,
            @RequestParam UUID courseId,
            @RequestParam String subject,
            @RequestParam String academicYear,
            @RequestParam ExamType examType,
            @RequestParam(required = false) String description,
            @RequestPart("file") MultipartFile file
    ) throws IOException {
        byte[] content = file.getBytes();
        String fileHash = sha256(content);

        Exam created = examService.uploadExam(
                currentUser.getStudentId(),
                courseId,
                subject,
                academicYear,
                examType,
                description,
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                content,
                fileHash
        );

        return ResponseEntity.status(201).body(created);
    }

    @GetMapping
    public ResponseEntity<Page<Exam>> listExams(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String major,
            @RequestParam(required = false) Integer courseYear,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) ExamType examType,
            @RequestParam(required = false) UUID uploaderId,
            Pageable pageable
    ) {
        Page<Exam> page = examService.listExams(
                subject,
                major,
                courseYear,
                academicYear,
                examType,
                uploaderId,
                pageable
        );
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{examId}")
    public ResponseEntity<Exam> getExam(@PathVariable UUID examId) {
        Exam exam = examService.getExam(examId);
        return ResponseEntity.ok(exam);
    }

    @GetMapping("/{examId}/download")
    public ResponseEntity<Resource> downloadExam(@PathVariable UUID examId) {
        Exam exam = examService.getExam(examId);
        examService.registerDownload(examId);

        String publicUrl = exam.getFileUrl();
        String relativePath = extractRelativePath(publicUrl);

        Resource resource = fileStorageService.loadAsResource(relativePath);

        String filename = "exam-" + examId + ".bin";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename(filename, StandardCharsets.UTF_8)
                        .build()
        );

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    private String sha256(byte[] content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(content);
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponible.", e);
        }
    }

    /**
     * Hypothèse :
     * exam.getFileUrl() ressemble à "/files/exams/uuid.pdf"
     * ou "http://host/files/exams/uuid.pdf"
     *
     * Cette méthode extrait la partie relative attendue par FileStorageService :
     * "exams/uuid.pdf"
     */
    private String extractRelativePath(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new IllegalArgumentException("URL de fichier invalide.");
        }

        int index = fileUrl.indexOf("/exams/");
        if (index >= 0) {
            return fileUrl.substring(index + 1); // => "exams/uuid.pdf"
        }

        index = fileUrl.indexOf("/course-resources/");
        if (index >= 0) {
            return fileUrl.substring(index + 1);
        }

        // fallback simple si déjà relatif
        if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://") && !fileUrl.startsWith("/")) {
            return fileUrl;
        }

        throw new IllegalArgumentException("Impossible d'extraire le chemin relatif depuis l'URL : " + fileUrl);
    }
}