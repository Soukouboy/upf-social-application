package com.upf.backend.application.services;

import com.upf.backend.application.model.entity.AdminProfile;
import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.model.entity.Enrollment;
import com.upf.backend.application.model.entity.ProfessorProfile;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.entity.User;
import com.upf.backend.application.model.enums.AdminLevel;
import com.upf.backend.application.model.enums.EnrollmentStatus;
import com.upf.backend.application.model.enums.UserRole;
import com.upf.backend.application.repository.AdminProfileRepository;
import com.upf.backend.application.repository.CourseRepository;
import com.upf.backend.application.repository.EnrollmentRepository;
import com.upf.backend.application.repository.ProfessorRepository;
import com.upf.backend.application.repository.StudentRepository;
import com.upf.backend.application.repository.UserRepository;
import com.upf.backend.application.services.Exceptions.BusinessException;
import com.upf.backend.application.services.Exceptions.ResourceNotFoundException;
import com.upf.backend.application.services.Interfaces.IAdminService;
import com.upf.backend.application.services.NotificationService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AdminServiceImpl implements IAdminService {

    private final ProfessorRepository professorRepository;
    private final AdminProfileRepository adminProfileRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    public AdminServiceImpl(AdminProfileRepository adminProfileRepository,
                            UserRepository userRepository,
                            StudentRepository studentRepository,
                            PasswordEncoder passwordEncoder,ProfessorRepository professorRepository,
                            CourseRepository courseRepository,EnrollmentRepository enrollmentRepository,
                            NotificationService notificationService) {
        this.adminProfileRepository = adminProfileRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.professorRepository = professorRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.notificationService = notificationService;
    }

    @Override
    public AdminProfile bootstrapInitialAdmin(String firstName,
                                              String lastName,
                                              String email,
                                              String rawPassword,
                                              AdminLevel adminLevel) {
        if (adminProfileRepository.count() > 0) {
            throw new BusinessException("Le bootstrap initial est déjà effectué. Un administrateur existe déjà.");
        }

        validateAdminCreationData(email, rawPassword, adminLevel);

        String normalizedEmail = normalizeEmail(email);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException("Un utilisateur existe déjà avec cet email.");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setActive(true);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(UserRole.ADMIN); 

   

        AdminProfile adminProfile = new AdminProfile();
        adminProfile.setAdminLevel(adminLevel);
        adminProfile.setUser(user); // Lien bidirectionnel
          
        user.setAdminProfile(adminProfile); // Lien bidirectionnel
        userRepository.save(user);
        notificationService.notifyAccountCreated(user, rawPassword);
         return adminProfile;
    }

    @Override
    public AdminProfile createAdminAccount(String firstName,
                                           String lastName,
                                           String email,
                                           String rawPassword,
                                           AdminLevel adminLevel) {
        validateAdminCreationData(email, rawPassword, adminLevel);

        String normalizedEmail = normalizeEmail(email);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException("Un utilisateur existe déjà avec cet email.");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setActive(true);
        user.setFirstName(firstName);
        user.setLastName(lastName);

     
        user.setRole(UserRole.ADMIN);

        AdminProfile adminProfile = new AdminProfile();
     
        adminProfile.setAdminLevel(adminLevel);
          adminProfile.setUser(user); // Lien bidirectionnel
        user.setAdminProfile(adminProfile); // Lien bidirectionnel
        userRepository.save(user);

      notificationService.notifyAccountCreated(user, rawPassword);
        return adminProfile;
    }

    @Override
    public AdminProfile promoteStudentToAdmin(UUID studentId,
                                              AdminLevel adminLevel) {
        if (adminLevel == null) {
            throw new BusinessException("Le niveau admin est obligatoire.");
        }

        StudentProfile student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil étudiant introuvable."));

        if (student.getUser() == null) {
            throw new BusinessException("Le profil étudiant n'est pas lié à un compte utilisateur.");
        }

        UUID userId = student.getUser().getId();

        if (student.getUser().getAdminProfile() != null) {
            throw new BusinessException("Cet utilisateur possède déjà un profil administrateur.");
        }

        User user = student.getUser();
        user.setRole(UserRole.ADMIN);
        AdminProfile adminProfile = new AdminProfile();
        adminProfile.setUser(user); // Lien bidirectionnel
        adminProfile.setAdminLevel(adminLevel);
            user.setAdminProfile(adminProfile); // Lien bidirectionnel

            userRepository.save(user); // Sauvegarde du user avec le nouveau rôle et le lien vers adminProfile
             
        return adminProfile;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminProfile> listAdmins() {
        return adminProfileRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminProfile getAdminProfile(UUID adminProfileId) {
        return adminProfileRepository.findById(adminProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil administrateur introuvable."));
    }

    @Override
    public AdminProfile updateAdminLevel(UUID adminProfileId,
                                         AdminLevel adminLevel) {
        if (adminLevel == null) {
            throw new BusinessException("Le niveau admin est obligatoire.");
        }

        AdminProfile adminProfile = adminProfileRepository.findById(adminProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil administrateur introuvable."));

        adminProfile.setAdminLevel(adminLevel);
        

        return adminProfileRepository.save(adminProfile);
    }

    @Override
    public void revokeAdminRights(UUID adminProfileId) {
        AdminProfile adminProfile = adminProfileRepository.findById(adminProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil administrateur introuvable."));

        User user = adminProfile.getUser();
        user.setRole(UserRole.STUDENT);    // ou un rôle par défaut
        user.setAdminProfile(null);
        adminProfileRepository.delete(adminProfile);
    }

    private void validateAdminCreationData(String email,
                                           String rawPassword,
                                           AdminLevel adminLevel) {
        if (email == null || email.isBlank()) {
            throw new BusinessException("L'email est obligatoire.");
        }

        if (rawPassword == null || rawPassword.length() < 8) {
            throw new BusinessException("Le mot de passe doit contenir au moins 8 caractères.");
        }

        if (adminLevel == null) {
            throw new BusinessException("Le niveau admin est obligatoire.");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
 

    
    // ─── Gestion professeurs ─────────────────────────────────────────────────

    @Override
    public ProfessorProfile createProfessorAccount(String firstName, String lastName,
                                                    String email, String rawPassword,
                                                    String department, String title,
                                                    List<UUID> courseIds) {
        if (email == null || email.isBlank())
            throw new BusinessException("L'email est obligatoire.");
        if (rawPassword == null || rawPassword.length() < 8)
            throw new BusinessException("Le mot de passe doit contenir au moins 8 caractères.");

        String normalizedEmail = normalizeEmail(email);
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException("Un utilisateur existe déjà avec cet email.");
        }

        String passe=passwordEncoder.encode(rawPassword);
        User user = new User(normalizedEmail,
                              passe, UserRole.PROFESSOR,firstName,lastName);

        ProfessorProfile professor = new ProfessorProfile();
        professor.setDepartment(department);
        professor.setTitle(title);
        professor.setUser(user);
        user.setProfessorProfile(professor);

        userRepository.save(user);

        // Assigner les cours si fournis
        if (courseIds != null && !courseIds.isEmpty()) {
            List<Course> courses = courseRepository.findAllById(courseIds);
            courses.forEach(course -> {
                if (course.getProfessor() != null) {
                    throw new BusinessException(
                        "Le cours " + course.getCode() + " est déjà assigné à un professeur.");
                }
                course.setProfessor(professor);
                // Synchroniser instructorName avec le vrai nom
                course.setInstructorName(
                    user.getFirstName() + " " + user.getLastName());
            });
            courseRepository.saveAll(courses);
        }

        return professor;
    }

    @Override
    public ProfessorProfile assignCourseToProfessor(UUID professorId, UUID courseId) {
        ProfessorProfile professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new ResourceNotFoundException("Professeur introuvable."));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable."));

        if (course.getProfessor() != null) {
            throw new BusinessException("Ce cours est déjà assigné à un professeur.");
        }

        course.setProfessor(professor);
        course.setInstructorName(
            professor.getUser().getFirstName() + " " + professor.getUser().getLastName());
        courseRepository.save(course);
        return professor;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfessorProfile> listProfessors() {
        return professorRepository.findAll();
    }

      // ─── Gestion étudiants ───────────────────────────────────────────────────

    @Override
    public Enrollment enrollStudentToCourse(UUID studentId, UUID courseId) {
        StudentProfile student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable."));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable."));

        if (enrollmentRepository.existsByStudentProfile_IdAndCourse_Id(studentId, courseId)) {
            throw new BusinessException("L'étudiant est déjà inscrit à ce cours.");
        }

        return enrollmentRepository.save(new Enrollment(student, course));
    }

    @Override
    public void unenrollStudentFromCourse(UUID studentId, UUID courseId) {
        Enrollment enrollment = enrollmentRepository
                .findByStudentProfile_IdAndCourse_Id(studentId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription introuvable."));
        enrollment.setStatus(EnrollmentStatus.INACTIVE);
        enrollmentRepository.save(enrollment);
    }

     // ─── Helpers ─────────────────────────────────────────────────────────────

    private User buildUser(String firstName, String lastName,
                            String email, String rawPassword, UserRole role) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setActive(true);
        return user;
    }

     private AdminProfile findAdminOrThrow(UUID adminProfileId) {
        return adminProfileRepository.findById(adminProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil admin introuvable."));
    }

    private void validateAdminData(String email, String rawPassword, AdminLevel adminLevel) {
        if (email == null || email.isBlank())
            throw new BusinessException("L'email est obligatoire.");
        if (rawPassword == null || rawPassword.length() < 8)
            throw new BusinessException("Le mot de passe doit contenir au moins 8 caractères.");
        if (adminLevel == null)
            throw new BusinessException("Le niveau admin est obligatoire.");
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentProfile> listStudents() {
        return studentRepository.findAll();
    }

}