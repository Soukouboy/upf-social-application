package com.upf.backend.application.services;
 
import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.model.entity.Enrollment;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.enums.EnrollmentStatus;
import com.upf.backend.application.repository.CourseRepository;
import com.upf.backend.application.repository.EnrollmentRepository;
import com.upf.backend.application.repository.StudentRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.upf.backend.application.services.Exceptions.BusinessException;
import com.upf.backend.application.services.Exceptions.ResourceNotFoundException;
import com.upf.backend.application.services.Interfaces.ICourseService;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CourseService implements ICourseService {

    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
        private final NotificationService notificationService;  

    public CourseService(CourseRepository courseRepository,
                         StudentRepository studentRepository,
                         EnrollmentRepository enrollmentRepository, NotificationService notificationService) {
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Course> listCourses(String major,
                                    Integer year,
                                    Integer semester,
                                    String search,
                                    Pageable pageable) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();

        return courseRepository.searchActiveCourses(
                major,
                year,
                semester,
                normalizedSearch,
                pageable
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Course getCourseDetails(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable."));

        if (!course.isActive()) {
            throw new ResourceNotFoundException("Cours introuvable ou inactif.");
        }

        // Les ressources seront accessibles via course.getResources()
        // si la relation est correctement mappée.
        return course;
    }

     @Override
    @Transactional(readOnly = true)
    public List<Course> getCoursesByMajor(String major) {
        return courseRepository.findByMajor(major, Pageable.unpaged()).getContent();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Course> getCoursesByProfessor(UUID professorId) {
        return courseRepository.findByProfessor_Id(professorId);
    }



    // ─── Inscriptions ────────────────────────────────────────────────────────

    @Override
    public Enrollment enrollStudent(UUID courseId, UUID studentId) {
        Course course = findOrThrow(courseId);
        StudentProfile student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable."));

        if (enrollmentRepository.existsByStudentProfile_IdAndCourse_Id(studentId, courseId)) {
            throw new BusinessException("L'étudiant est déjà inscrit à ce cours.");
        }


    Enrollment enrollment = enrollmentRepository.save(new Enrollment(student, course));
    
// ✅ Après — appelé après le commit
TransactionSynchronizationManager.registerSynchronization(
    new TransactionSynchronization() {
        @Override
        public void afterCommit() {
            notificationService.notifyEnrollment(student, course);
        }
    }
);

        return enrollment;
    }

    @Override
    public void unenrollStudent(UUID courseId, UUID studentId) {
        Enrollment enrollment = enrollmentRepository
                .findByStudentProfile_IdAndCourse_Id(studentId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription introuvable."));

        // ✅ On désactive — on conserve l'historique
        enrollment.setStatus(EnrollmentStatus.INACTIVE);

        
        enrollmentRepository.save(enrollment);

        
// ✅ Après — appelé après le commit
TransactionSynchronizationManager.registerSynchronization(
    new TransactionSynchronization() {
        @Override
        public void afterCommit() {
            // notificationService.notifyUnenrollment(enrollment.getStudentProfile(), enrollment.getCourse());
        }
    }
);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Course> getCoursesForStudent(UUID studentId) {
        return enrollmentRepository
                .findByStudentProfile_IdAndStatus(studentId, EnrollmentStatus.ACTIVE)
                .stream()
                .map(Enrollment::getCourse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasStudentAccess(UUID courseId, UUID studentId) {
        return enrollmentRepository
                .existsByStudentProfile_IdAndCourse_IdAndStatus(studentId, courseId, EnrollmentStatus.ACTIVE);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private Course findOrThrow(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable."));
    }





}