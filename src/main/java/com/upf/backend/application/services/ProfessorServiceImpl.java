package com.upf.backend.application.services;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.upf.backend.application.dto.student.StudentProfileSummary;
import com.upf.backend.application.mapper.StudentMapper;
<<<<<<< HEAD
=======
import com.upf.backend.application.services.Interfaces.IFollowService;
>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164
import com.upf.backend.application.model.entity.Announcement;
import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.model.entity.CourseResource;
import com.upf.backend.application.model.entity.Enrollment;
import com.upf.backend.application.model.entity.ProfessorProfile;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.entity.User;
import com.upf.backend.application.model.enums.EnrollmentStatus;
import com.upf.backend.application.model.enums.FileType;
<<<<<<< HEAD
import com.upf.backend.application.services.Interfaces.IFollowService;
=======
>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164
import com.upf.backend.application.repository.AnnouncementRepository;
import com.upf.backend.application.repository.CourseRepository;
import com.upf.backend.application.repository.CourseResourceRepository;
import com.upf.backend.application.repository.EnrollmentRepository;
import com.upf.backend.application.repository.ProfessorRepository;
import com.upf.backend.application.services.Exceptions.BusinessException;
import com.upf.backend.application.services.Exceptions.ResourceNotFoundException;
import com.upf.backend.application.services.Interfaces.IProfessorService;


@Service
@Transactional
public class ProfessorServiceImpl implements IProfessorService {

     private final ProfessorRepository professorRepository;
    private final CourseRepository courseRepository;
    private final CourseResourceRepository courseResourceRepository;
    private final AnnouncementRepository announcementRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final NotificationService notificationService;
    private final IFollowService followService;

    public ProfessorServiceImpl(ProfessorRepository professorRepository,
                                CourseRepository courseRepository,
                                CourseResourceRepository courseResourceRepository,
                                AnnouncementRepository announcementRepository,
                                EnrollmentRepository enrollmentRepository,
                                NotificationService notificationService,
                                IFollowService followService) {
        this.professorRepository = professorRepository;
        this.courseRepository = courseRepository;
        this.courseResourceRepository = courseResourceRepository;
        this.announcementRepository = announcementRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.notificationService = notificationService;
        this.followService = followService;
    }

    
    // ─── Cours ───────────────────────────────────────────────────────────────

    @Override
    public List<Course> getMyCourses(UUID professorId) {
        return courseRepository.findByProfessor_Id(professorId);
    }

 

    @Override
    public Course removeCourse(UUID professorId, UUID courseId) {
        Course course = findCourseOrThrow(courseId);
        validateProfessorOwnsCourse(course, professorId);
        course.setProfessor(null);
        return courseRepository.save(course);
    }


    @Override
    public Course assignCourse(UUID professorId, UUID courseId) {
        ProfessorProfile professor = findProfessorOrThrow(professorId);
        Course course = findCourseOrThrow(courseId);

        if (course.getProfessor() != null) {
            throw new BusinessException("Ce cours est déjà assigné à un professeur.");
        }

        course.setProfessor(professor);
        return courseRepository.save(course);
    }

    @Override
    @Transactional(readOnly = true)
    public ProfessorProfile getProfessorProfile(UUID professorId) {
        return findProfessorOrThrow(professorId);
    }


    // ─── Méthodes utilitaires ─────────────────────────────────────────────── 
    // ─── Helpers ─────────────────────────────────────────────────────────────

    private ProfessorProfile findProfessorOrThrow(UUID professorId) {
        return professorRepository.findById(professorId)
                .orElseThrow(() -> new ResourceNotFoundException("Professeur introuvable."));
    }

    private Course findCourseOrThrow(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable."));
    }

    private void validateProfessorOwnsCourse(Course course, UUID professorId) {
        if (course.getProfessor() == null
                || !course.getProfessor().getId().equals(professorId)) {
            throw new BusinessException("Ce cours ne vous appartient pas.");
        }
    }


@Override
    @Transactional(readOnly = true)
    public List<StudentProfileSummary> getStudentsInCourse(UUID professorId, UUID courseId) {
        Course course = findCourseOrThrow(courseId);
        validateProfessorOwnsCourse(course, professorId);

        return enrollmentRepository
                .findByCourse_IdAndStatus(courseId, EnrollmentStatus.ACTIVE)
                .stream()
                .map(Enrollment::getStudentProfile)
                .map(student -> StudentMapper.toSummaryWithFollowers(student, (int) followService.countFollowers(student.getId())))
                .toList();
    }

 @Override
    public CourseResource uploadResource(UUID professorId,
                                          UUID courseId,
                                          String title,
                                          String fileUrl,
                                          FileType fileType,
                                          Long fileSizeBytes,
                                          boolean isExternal) {
        ProfessorProfile professor = findProfessorOrThrow(professorId);
        User professorUser = professor.getUser();
        Course course = findCourseOrThrow(courseId);
        validateProfessorOwnsCourse(course, professorId);
 
        if (title == null || title.isBlank()) {
            throw new BusinessException("Le titre de la ressource est obligatoire.");
        }
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new BusinessException("L'URL du fichier est obligatoire.");
        }
 
        CourseResource resource = new CourseResource();
        resource.setTitle(title);
        resource.setFileUrl(fileUrl);
        resource.setFileType(fileType);
        resource.setFileSizeBytes(fileSizeBytes);
        resource.setExternal(isExternal);
 
        // ✅ Relation bidirectionnelle via helper method de Course
        course.addResource(resource);             // gère resource.setCourse(course)
        resource.setUploadedBy(professorUser); // relation directe vers User (professeur)
 
        CourseResource saved = courseResourceRepository.save(resource);
 
        // ✅ Notifier tous les étudiants actifs du cours (email + WebSocket)
        notificationService.notifyNewResource(saved);
 
        return saved;
    }
 @Override
    public void deleteResource(UUID professorId, UUID resourceId) {
        CourseResource resource = courseResourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Ressource introuvable."));
 
        // ✅ uploadedByProfessor est la relation (pas uploadedBy UUID brut)
        if (resource.getUploadedBy() == null
                || !resource.getUploadedBy().getId().equals(professorId)) {
            throw new BusinessException(
                "Vous n'êtes pas autorisé à supprimer cette ressource.");
        }
 
        // ✅ Retirer de la collection Course → orphanRemoval = true supprime en cascade
        Course course = resource.getCourse();
        if (course != null) {
            course.removeResource(resource); // helper method dans Course
        }
 
        courseResourceRepository.delete(resource);
    }
 
 /**
     * Liste toutes les ressources d'un cours appartenant à ce professeur.
     * Appelé par GET /professors/me/courses/{courseId}/resources
     */
    @Override
    @Transactional(readOnly = true)
    public List<CourseResource> getResourcesByCourse(UUID professorId, UUID courseId) {
        Course course = findCourseOrThrow(courseId);
        validateProfessorOwnsCourse(course, professorId);
 
        // ✅ Via repository — pas via course.getResources() pour éviter lazy loading
        return courseResourceRepository.findByCourse_Id(courseId);
    }

 @Override
    public Announcement createAnnouncement(UUID professorId,
                                            UUID courseId,
                                            String title,
                                            String content) {
        ProfessorProfile professor = findProfessorOrThrow(professorId);
        Course course = findCourseOrThrow(courseId);
        validateProfessorOwnsCourse(course, professorId);
 
        if (title == null || title.isBlank()) {
            throw new BusinessException("Le titre de l'annonce est obligatoire.");
        }
        if (content == null || content.isBlank()) {
            throw new BusinessException("Le contenu de l'annonce est obligatoire.");
        }
 
        Announcement announcement = new Announcement();
        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setCourse(course);
        announcement.setProfessor(professor);
 
        Announcement saved = announcementRepository.save(announcement);
 
        // ✅ Notifier tous les étudiants actifs (email + WebSocket via NotificationService)
        notificationService.notifyNewAnnouncement(saved);
 
        return saved;
    }
 


	@Override
    public void deleteAnnouncement(UUID professorId, UUID announcementId) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Annonce introuvable."));
 
        if (!announcement.getProfessor().getId().equals(professorId)) {
            throw new BusinessException(
                "Vous n'êtes pas autorisé à supprimer cette annonce.");
        }
 
        announcementRepository.delete(announcement);
    }

	@Override
    @Transactional(readOnly = true)
    public List<Announcement> getAnnouncementsByCourse(UUID courseId) {
        // ✅ Pas besoin de valider le prof ici — endpoint public aux inscrits
        findCourseOrThrow(courseId); // valider l'existence du cours
        return announcementRepository.findByCourse_IdOrderByCreatedAtDesc(courseId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Announcement> getAnnouncementsByProfessor(UUID professorId) {
        findProfessorOrThrow(professorId); // valider l'existence du prof
        return announcementRepository.findByProfessor_Id(professorId);
    }
}