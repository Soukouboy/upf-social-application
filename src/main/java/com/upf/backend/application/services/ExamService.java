package com.upf.backend.application.services;


import com.upf.backend.application.model.entity.*;
import com.upf.backend.application.model.enums.*;
import com.upf.backend.application.repository.*;

import org.apache.commons.logging.Log;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.io.File;
import java.util.UUID;


import com.upf.backend.application.services.Exceptions.ResourceNotFoundException;
import com.upf.backend.application.services.Exceptions.BusinessException;
import com.upf.backend.application.services.Interfaces.IExamService;
import com.upf.backend.application.services.SupabaseStorageService;
import com.upf.backend.application.services.Interfaces.StoredFileDescriptor;


@Service
@Transactional
public class ExamService implements IExamService {

    private static final Logger log=LoggerFactory.getLogger(ExamService.class);
    private final ExamRepository examRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final ExamVoteRepository examVoteRepository;
    private final ExamReportRepository examReportRepository;
    private final ExamCommentRepository examCommentRepository;
    private final SupabaseStorageService fileStorageService;
    private final NotificationService notificationService;

    public ExamService(ExamRepository examRepository,
                        CourseRepository courseRepository,
                        StudentRepository studentRepository,
                        ExamVoteRepository examVoteRepository,
                        ExamReportRepository examReportRepository,
                        ExamCommentRepository examCommentRepository,
                        SupabaseStorageService fileStorageService,
                        NotificationService notificationService) {
        this.examRepository = examRepository;
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
        this.examVoteRepository = examVoteRepository;
        this.examReportRepository = examReportRepository;
        this.examCommentRepository = examCommentRepository;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
    }

    @Override
    public Exam uploadExam(UUID uploaderId,
                           UUID courseId,
                           String subject,
                           String academicYear,
                           ExamType examType,
                           String description,
                           String originalFilename,
                           FileType contentType,
                           long size,
                           MultipartFile file,
                           String fileHash) {

        validateExamMetadata(subject, academicYear, examType, fileHash);

        if (examRepository.existsByFileHash(fileHash)) {
            throw new BusinessException("Une épreuve identique existe déjà (doublon détecté par hash).");
        }

        StudentProfile uploader = studentRepository.findById(uploaderId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant déposant introuvable."));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable."));

        if (!course.isActive()) {
            throw new BusinessException("Impossible de déposer une épreuve sur un cours inactif.");
        }

  
        // ✅ Correct — upload d'abord, save une seule fois
        UUID examId = UUID.randomUUID();

        StoredFileDescriptor storedFile = fileStorageService.storeExamFile(file, examId.toString());

        Exam exam = new Exam();
        exam.setUploader(uploader);
        exam.setCourse(course);
        exam.setTitle(subject);
        exam.setAcademicYear(academicYear);
        exam.setExamType(examType);
        exam.setDescription(description);
        exam.setFileHash(fileHash);
        exam.setHidden(false);
        exam.setFileUrl(storedFile.publicUrl());
        exam.setStoragePath(storedFile.relativePath());
        exam.setFileSizeBytes(size);
        return examRepository.save(exam);
    }

 


    // ── Recherche générale (PROFESSOR / ADMIN) ────────────────────────────────
public Page<Exam> listExams(String title, Major major, Integer courseYear,
                             String academicYear, ExamType examType,
                             UUID uploaderId, Pageable pageable) {
    Specification<Exam> spec = Specification
        .where(ExamSpecification.visibleExams())
        .and(ExamSpecification.withTitle(title))
        .and(ExamSpecification.withMajor(major))
        .and(ExamSpecification.withCourseYear(courseYear))
        .and(ExamSpecification.withAcademicYear(academicYear))
        .and(ExamSpecification.withExamType(examType))
        .and(ExamSpecification.withUploaderId(uploaderId));

    return examRepository.findAll(spec, pageable);
}

// ── Recherche par filière (STUDENT) ───────────────────────────────────────
public Page<Exam> listExamsByMajor( Major studentMajor, String title,
                                    Integer courseYear, String academicYear,
                                    ExamType examType, Pageable pageable) {

    log.info("🔍 Recherche examens — filière: {}", studentMajor); 
    Specification<Exam> spec = Specification
        .where(ExamSpecification.visibleExams())
        .and(ExamSpecification.withMajor(studentMajor))  // filière obligatoire
        .and(ExamSpecification.withTitle(title))
        .and(ExamSpecification.withCourseYear(courseYear))
        .and(ExamSpecification.withAcademicYear(academicYear))
        .and(ExamSpecification.withExamType(examType));

   Page<Exam> result = examRepository.findAll(spec, pageable);
    log.info("📊 Résultats trouvés: {}", result.getTotalElements());
    return result;
}


    @Override
    @Transactional(readOnly = true)
    public Exam getExam(UUID examId) {
        return examRepository.findByIdAndIsHiddenFalse(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Épreuve introuvable."));
    }

    @Override
    public void registerDownload(UUID examId) {
        Exam exam = examRepository.findByIdAndIsHiddenFalse(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Épreuve introuvable."));

        exam.setDownloadCount(exam.getDownloadCount() + 1);
        examRepository.save(exam);
    }

    private void validateExamMetadata(String subject,
                                      String academicYear,
                                      ExamType examType,
                                      String fileHash) {
        if (subject == null || subject.isBlank()) {
            throw new BusinessException("La matière est obligatoire.");
        }
        if (academicYear == null || academicYear.isBlank()) {
            throw new BusinessException("L'année académique est obligatoire.");
        }
        if (examType == null) {
            throw new BusinessException("Le type d'épreuve est obligatoire.");
        }
        if (fileHash == null || fileHash.isBlank()) {
            throw new BusinessException("Le hash du fichier est obligatoire.");
        }
    }

        public void hideExam(UUID examId) {
        Exam exam = getExam(examId);
        exam.setHidden(true);
        examRepository.save(exam);
    }

    public void showExam(UUID examId) {
        Exam exam = getExam(examId);
        exam.setHidden(false);
        examRepository.save(exam);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Votes, Rapports et Commentaires
    // ────────────────────────────────────────────────────────────────────────

    public void voteExam(UUID examId, UUID studentId, VoteType voteType) {
        Exam exam = getExam(examId);
        StudentProfile student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable."));

        // Vérifier si l'étudiant a déjà voté
        var existingVote = examVoteRepository.findByExam_IdAndStudent_Id(examId, studentId);

        if (existingVote.isPresent()) {
            ExamVote vote = existingVote.get();
            VoteType oldType = vote.getVoteType();
            
            // Si le même vote, le supprimer (toggle)
            if (oldType == voteType) {
                examVoteRepository.delete(vote);
                // Mettre à jour les compteurs
                if (voteType == VoteType.UPVOTE) {
                    exam.setUpvoteCount(Math.max(0, exam.getUpvoteCount() - 1));
                } else {
                    exam.setDownvoteCount(Math.max(0, exam.getDownvoteCount() - 1));
                }
            } else {
                // Sinon, le changer
                vote.setVoteType(voteType);
                examVoteRepository.save(vote);
                
                // Mettre à jour les compteurs
                if (oldType == VoteType.UPVOTE) {
                    exam.setUpvoteCount(Math.max(0, exam.getUpvoteCount() - 1));
                } else {
                    exam.setDownvoteCount(Math.max(0, exam.getDownvoteCount() - 1));
                }
                
                if (voteType == VoteType.UPVOTE) {
                    exam.setUpvoteCount(exam.getUpvoteCount() + 1);
                } else {
                    exam.setDownvoteCount(exam.getDownvoteCount() + 1);
                }
            }
        } else {
            // Créer un nouveau vote
            ExamVote vote = new ExamVote();
            vote.setExam(exam);
            vote.setStudent(student);
            vote.setVoteType(voteType);
            examVoteRepository.save(vote);
            
            // Mettre à jour les compteurs
            if (voteType == VoteType.UPVOTE) {
                exam.setUpvoteCount(exam.getUpvoteCount() + 1);
            } else {
                exam.setDownvoteCount(exam.getDownvoteCount() + 1);
            }
        }

        examRepository.save(exam);
    }

    public void reportExam(UUID examId, UUID studentId, ReportReason reason, String details) {
        Exam exam = getExam(examId);
        StudentProfile student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable."));

        if (reason == null) {
            throw new BusinessException("La raison du signalement est obligatoire.");
        }

        ExamReport report = new ExamReport();
        report.setExam(exam);
        report.setReportedBy(student);
        report.setReason(reason);
        report.setDetails(details);
        report.setStatus(ReportStatus.PENDING);

        examReportRepository.save(report);
    }

    public void addComment(UUID examId, UUID studentId, String content) {
        if (content == null || content.isBlank()) {
            throw new BusinessException("Le contenu du commentaire ne peut pas être vide.");
        }

        Exam exam = getExam(examId);
        StudentProfile student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable."));

        ExamComment comment = new ExamComment();
        comment.setExam(exam);
        comment.setAuthor(student);
        comment.setContent(content.trim());

        examCommentRepository.save(comment);
    }

    private String normalize(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}