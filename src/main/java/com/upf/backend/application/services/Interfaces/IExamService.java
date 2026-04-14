package com.upf.backend.application.services.Interfaces;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.upf.backend.application.model.entity.Exam;
import com.upf.backend.application.model.enums.ExamType;
import com.upf.backend.application.model.enums.FileType;
import com.upf.backend.application.model.enums.Major;

import java.io.File;
import java.util.UUID;

public interface IExamService {

    Exam uploadExam(UUID uploaderId,
                    UUID courseId,
                    String subject,
                    String academicYear,
                    ExamType examType,
                    String description,
                    String originalFilename,
                    FileType contentType,
                    long size,
                    MultipartFile file,
                    String fileHash);

    Page<Exam> listExams(String subject,
                         Major major,
                         Integer courseYear,
                         String academicYear,
                         ExamType examType,
                         UUID uploaderId,
                         Pageable pageable);

    Exam getExam(UUID examId);

    void registerDownload(UUID examId);

    Page<Exam> listExamsByMajor( Major studentMajor, String title, Integer courseYear, String academicYear,
            ExamType examType, Pageable pageable);

}
