package com.upf.backend.application.controller;

import com.upf.backend.application.dto.exam.ExamDetails;
import com.upf.backend.application.dto.exam.ExamResponse;
import com.upf.backend.application.dto.exam.ExamSummary;
import com.upf.backend.application.mapper.ExamMapper;
import com.upf.backend.application.model.entity.Exam;
import com.upf.backend.application.model.enums.ExamType;
import com.upf.backend.application.model.enums.FileType;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.ExamService;
import com.upf.backend.application.services.SupabaseStorageService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@RestController
@RequestMapping("/exams")
public class ExamController {

    private final ExamService examService;
    private final SupabaseStorageService fileStorageService;

    public ExamController(ExamService examService,
                          SupabaseStorageService fileStorageService) {
        this.examService = examService;
        this.fileStorageService = fileStorageService;
    }

    // ─── Upload d'un examen ───────────────────────────────────────────────────

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ExamResponse> uploadExam(
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
                currentUser.getProfileId(),
                courseId,
                subject,
                academicYear,
                examType,
                description,
                file.getOriginalFilename(),
                FileType.fromContentType(file.getContentType()),
                file.getSize(),
                file,       // MultipartFile directement
                fileHash
        );

        return ResponseEntity.status(201).body(ExamMapper.toResponse(created));
    }

    // ─── Liste des examens ────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<Page<ExamSummary>> listExams(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String major,
            @RequestParam(required = false) Integer courseYear,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) ExamType examType,
            @RequestParam(required = false) UUID uploaderId,
            Pageable pageable
    ) {
        Page<Exam> page = examService.listExams(
                subject, major, courseYear, academicYear, examType, uploaderId, pageable
        );
        return ResponseEntity.ok(page.map(ExamMapper::toSummary));
    }

    // ─── Détail d'un examen ───────────────────────────────────────────────────

    @GetMapping("/{examId}")
    public ResponseEntity<ExamDetails> getExam(@PathVariable UUID examId) {
        Exam exam = examService.getExam(examId);
        return ResponseEntity.ok(ExamMapper.toDetails(exam));
    }

    // ─── Téléchargement d'un examen ──────────────────────────────────────────
    /**
     * Le bucket "exams" est PRIVÉ → on génère une URL signée valable 1 heure,
     * puis on redirige le navigateur vers cette URL.
     * Supabase envoie directement le fichier au client, sans passer par Spring Boot.
     */
    @GetMapping("/{examId}/download")
    public ResponseEntity<Void> downloadExam(@PathVariable UUID examId) {
        Exam exam = examService.getExam(examId);
        examService.registerDownload(examId);

        // exam.getStoragePath() = "exam-{uuid}/nom-fichier.pdf" (chemin dans le bucket)
        String signedUrl = fileStorageService.generateSignedUrl(
                "exams",
                exam.getFileUrl(),
                3600  // 1 heure
        );

        // Redirection 302 → le client télécharge directement depuis Supabase
        return ResponseEntity.status(302)
                .location(URI.create(signedUrl))
                .build();
    }

    // ─── Utilitaires ─────────────────────────────────────────────────────────

    private String sha256(byte[] content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(content);
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponible.", e);
        }
    }
}