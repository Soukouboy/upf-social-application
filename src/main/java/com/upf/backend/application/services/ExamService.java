package com.upf.backend.application.services;


import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.model.entity.Exam;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.enums.ExamType;
import com.upf.backend.application.model.enums.FileType;
import com.upf.backend.application.repository.CourseRepository;
import com.upf.backend.application.repository.ExamRepository;
import com.upf.backend.application.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    private final ExamRepository examRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final SupabaseStorageService fileStorageService;
    private final NotificationService notificationService;

    public ExamService(ExamRepository examRepository,
                        CourseRepository courseRepository,
                        StudentRepository studentRepository,
                        SupabaseStorageService fileStorageService,
                        NotificationService notificationService) {
        this.examRepository = examRepository;
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
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

  

        Exam exam = new Exam();
        exam.setUploader(uploader);
        exam.setCourse(course);
        exam.setTitle(subject);
        exam.setAcademicYear(academicYear);
        exam.setExamType(examType);
        exam.setDescription(description);
        exam.setFileUrl("string"); // sera mis à jour après stockage
        exam.setFileHash(fileHash);
        exam.setHidden(false);

     Exam exam1= examRepository.save(exam);
    StoredFileDescriptor storedFile = fileStorageService.storeExamFile(file, exam1.getId().toString());
    exam1.setFileUrl(null); // URL public non utilisé, on se base sur le chemin de stockage
    exam1.setStoragePath(storedFile.relativePath());

    Exam exam2 = examRepository.save(exam1);
     
                
// // ✅ Après — appelé après le commit
// TransactionSynchronizationManager.registerSynchronization(
//     new TransactionSynchronization() {
//         @Override
//         public void afterCommit() {
//             notificationService.notify
//         }
//     }
// );

        return exam2;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Exam> listExams(String subject,
                                String major,
                                Integer courseYear,
                                String academicYear,
                                ExamType examType,
                                UUID uploaderId,
                                Pageable pageable) {
        return examRepository.searchVisibleExams(
                normalize(subject),
                normalize(major),
                courseYear,
                normalize(academicYear),
                examType,
                uploaderId,
                pageable
        );
    }

    @Override
    public Page<Exam> listExamsByMajor(String studentMajor, String title,
                                    Integer courseYear, String academicYear,
                                ExamType examType, Pageable pageable) {
    return examRepository.searchExamsByMajor(
            studentMajor, title, courseYear, academicYear, examType, pageable
    );
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

    private String normalize(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}