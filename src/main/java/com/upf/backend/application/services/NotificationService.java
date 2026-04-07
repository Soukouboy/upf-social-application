package com.upf.backend.application.services;

import java.util.List;
import java.util.Properties;
import java.util.UUID;


import java.util.Optional;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.upf.backend.application.dto.WsNotification;
import com.upf.backend.application.model.entity.AcademicGroup;
import com.upf.backend.application.model.entity.Announcement;
import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.model.entity.CourseResource;
import com.upf.backend.application.model.entity.Enrollment;
import com.upf.backend.application.model.entity.Messages;
import com.upf.backend.application.model.entity.Notification;
import com.upf.backend.application.model.entity.ProfessorProfile;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.entity.User;
import com.upf.backend.application.model.enums.EnrollmentStatus;
import com.upf.backend.application.model.enums.NotificationStatus;
import com.upf.backend.application.model.enums.NotificationType;
import com.upf.backend.application.model.enums.UserRole;
import com.upf.backend.application.repository.NotificationRepository;
import com.upf.backend.application.repository.UserRepository;
import com.upf.backend.application.repository.EnrollmentRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final WsNotificationSender wsNotificationSender;
    private final EmailService emailService;
    
        // Injections à ajouter dans le constructeur
        // private final WsNotificationSender wsNotificationSender;

    // ── SMTP config ────────────────────────────────────────────────────────

    private static final String FROM_NAME     = "UPF University";

    public NotificationService(NotificationRepository notificationRepository,
                                UserRepository userRepository,
                                EnrollmentRepository enrollmentRepository,
                                WsNotificationSender wsNotificationSender,
                                EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.userRepository         = userRepository;
        this.enrollmentRepository   = enrollmentRepository;
        this.wsNotificationSender   = wsNotificationSender;
        this.emailService = emailService;
    }

    // =========================================================================
    // TRIGGERS — appelés depuis les services métier
    // =========================================================================

    // ── Compte ────────────────────────────────────────────────────────────────

    /**
     * Appelé dans AuthServiceImpl.registerStudent()
     * et AdminServiceImpl.createProfessorAccount()
     */
    @Async
    public void notifyWelcome(User user) {
        String subject = "Bienvenue sur UPF Connect !";
        send(user, null, NotificationType.WELCOME, subject,
             buildWelcome(user));
    }

    /**
     * Appelé dans AdminServiceImpl.createProfessorAccount()
     * Notifie le professeur que son compte a été créé par un admin
     */
    @Async
    public void notifyAccountCreated(User professor, String rawPassword) {
        String subject = "Votre compte UPF Connect a été créé";
        send(professor, null, NotificationType.ACCOUNT_CREATED, subject,
             buildAccountCreated(professor, rawPassword));
    }

    // ── Cours & ressources ────────────────────────────────────────────────────

    /**
     * Appelé dans AdminServiceImpl.enrollStudentToCourse()
     * Notifie l'étudiant qu'il a été inscrit à un cours
     */
    @Async
    public void notifyEnrollment(StudentProfile student, Course course) {
        User user = student.getUser();
        String subject = "Inscription confirmée — " + course.getTitle();
        send(user, null, NotificationType.ENROLLMENT_CONFIRMED, subject,
             buildEnrollment(user, course));
    }

    /**
     * Appelé dans ProfessorServiceImpl.uploadResource()
     * Notifie tous les étudiants ACTIFS du cours
     */
    @Async
    public void notifyNewResource(CourseResource resource) {
        Course course       = resource.getCourse();
        User prof = resource.getUploadedBy();
        String subject      = "Nouveau document — " + course.getTitle();

        // ✅ Notifier uniquement les étudiants actifs du cours
        List<StudentProfile> students = getActiveStudents(course);
        students.forEach(student ->
            send(student.getUser(), null, NotificationType.NEW_RESOURCE,
                 subject, buildNewResource(student.getUser(), resource, prof))
        );
    }

    /**
     * Appelé dans ProfessorServiceImpl.createAnnouncement()
     * Notifie tous les étudiants ACTIFS du cours
     */
    // public void notifyNewAnnouncement(Announcement announcement) {
    //     Course course = announcement.getCourse();
    //     String subject = "Annonce — " + course.getTitle()
    //                    + " : " + announcement.getTitle();

    //     List<StudentProfile> students = getActiveStudents(course);
    //     students.forEach(student ->
    //         send(student.getUser(), null, NotificationType.NEW_ANNOUNCEMENT,
    //              subject, buildAnnouncement(student.getUser(), announcement))
    //     );
    // }



    // Dans NotificationService — injecter WsNotificationSender
 @Async   
public void notifyNewAnnouncement(Announcement announcement) {
    Course course = announcement.getCourse();
    List<StudentProfile> students = getActiveStudents(course);

    students.forEach(student -> {
        // Email
        send(student.getUser(), null, NotificationType.NEW_ANNOUNCEMENT,
             "Annonce — " + course.getTitle() + " : " + announcement.getTitle(),
             buildAnnouncement(student.getUser(), announcement));

        // ✅ Temps réel WebSocket
        wsNotificationSender.notify(
            student.getUser().getEmail(),
            new WsNotification(
                "NEW_ANNOUNCEMENT",
                "Nouvelle annonce — " + course.getTitle(),
                announcement.getTitle(),
                announcement.getId()
            )
        );
    });
}

    // ── Social ────────────────────────────────────────────────────────────────

    /**
     * Appelé dans MessageService (ou GroupService) lors d'un nouveau message
     * Notifie le destinataire (message privé) ou les membres (groupe)
     */
    @Async
    public void notifyNewMessage(User recipient, User sender, String messagePreview) {
        String subject = "Nouveau message de "
                       + sender.getFirstName() + " " + sender.getLastName();
        send(recipient, null, NotificationType.NEW_MESSAGE, subject,
             buildNewMessage(recipient, sender, messagePreview));
    }

    /**
     * Appelé dans FollowService lors d'un nouveau follower
     */
    @Async
    public void notifyNewFollower(User followed, User follower) {
        String subject = follower.getFirstName() + " " + follower.getLastName()
                       + " vous suit maintenant";
        send(followed, null, NotificationType.NEW_FOLLOWER, subject,
             buildNewFollower(followed, follower));
    }

    /**
     * Appelé dans GroupService quand un membre rejoint un groupe
     * Notifie le créateur du groupe
     */
    @Async
    public void notifyNewGroupMember(User groupOwner, User newMember,
                                      AcademicGroup group) {
        String subject = newMember.getFirstName() + " a rejoint "
                       + group.getName();
        send(groupOwner, null, NotificationType.NEW_GROUP_MEMBER, subject,
             buildNewGroupMember(groupOwner, newMember, group));
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    /**
     * Alertes système envoyées à tous les admins
     */
    @Async
    public void notifyAdmins(String alertSubject, String alertMessage) {
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        admins.forEach(admin ->
            send(admin, null, NotificationType.ADMIN_ALERT,
                 alertSubject, alertMessage)
        );
    }

    // =========================================================================
    // GESTION DES NOTIFICATIONS (lecture, marquage)
    // =========================================================================

    @Async
    public List<Notification> getNotificationsForUser(UUID userId) {
        return notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(userId);
    }

    @Async
    public List<Notification> getUnreadForUser(UUID userId) {
        return notificationRepository.findByRecipient_IdAndIsReadFalse(userId);
    }

    @Async
    public long countUnread(UUID userId) {
        return notificationRepository.countByRecipient_IdAndIsReadFalse(userId);
    }

    @Async

    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.isRead();
            notificationRepository.save(n);
        });
    }

    @Async
    public void markAllAsRead(UUID userId) {
        List<Notification> unread = getUnreadForUser(userId);
        unread.forEach(n -> n.isRead());
        notificationRepository.saveAll(unread);
    }

    @Async
    public void retryFailed() {
        notificationRepository.findByStatus(NotificationStatus.FAILED)
            .forEach(n -> {
                emailService.sendEmail(
                    n.getRecipient().getEmail(),
                    n.getTitle(),
                    n.getContent()
                );
                //if (sent) n.markAsSent();
                notificationRepository.save(n);
            });
    }

    // =========================================================================
    // MÉTHODE GÉNÉRIQUE D'ENVOI
    // =========================================================================
private void send(User user, Object relatedEntity,
                  NotificationType type, String subject, String message) {

    // 1. Sauvegarde DB (rapide)
    Notification notification = new Notification();
    notification.setRecipient(user);
    notification.setType(type);
    notification.setTitle(subject);
    notification.setContent(message);
    notification.setStatus(NotificationStatus.PENDING);

    Notification saved = notificationRepository.save(notification);

    // 2. Envoi email ASYNC (non bloquant)
    try {
        emailService.sendEmail(user.getEmail(), subject, message);
        saved.markAsSent();
    } catch (Exception e) {
        saved.markAsFailed();
        System.err.println("❌ Échec envoi email à : " + user.getEmail());
    }

    // 3. Update status
    notificationRepository.save(saved);
}

    // =========================================================================
    // SMTP — inchangé, même logique que ton code existant
    // =========================================================================

 

    // =========================================================================
    // TEMPLATES HTML
    // =========================================================================

    private String buildWelcome(User user) {
        return "<html><body>" +
               "<h2>Bienvenue sur UPF Connect, " + user.getFirstName() + " !</h2>" +
               "<p>Votre compte étudiant est actif. Vous pouvez dès maintenant :</p>" +
               "<ul>" +
               "<li>Consulter vos cours</li>" +
               "<li>Accéder aux ressources pédagogiques</li>" +
               "<li>Rejoindre des groupes académiques</li>" +
               "</ul>" +
               "<p>À bientôt,<br><strong>UPF University</strong></p>" +
               "</body></html>";
    }

    private String buildAccountCreated(User professor, String tempPassword) {
        return "<html><body>" +
               "<h2>Votre compte UPF Connect</h2>" +
               "<p>Bonjour " + professor.getFirstName() + ",</p>" +
               "<p>Un compte professeur a été créé pour vous.</p>" +
               "<ul>" +
               "<li><strong>Email :</strong> " + professor.getEmail() + "</li>" +
               "<li><strong>Mot de passe temporaire :</strong> " + tempPassword + "</li>" +
               "</ul>" +
               "<p>Veuillez changer votre mot de passe à la première connexion.</p>" +
               "<p><strong>UPF University</strong></p>" +
               "</body></html>";
    }

    private String buildEnrollment(User user, Course course) {
        return "<html><body>" +
               "<h2>Inscription confirmée</h2>" +
               "<p>Bonjour " + user.getFirstName() + ",</p>" +
               "<p>Vous avez été inscrit au cours :</p>" +
               "<ul>" +
               "<li><strong>Cours :</strong> " + course.getTitle() + "</li>" +
               "<li><strong>Code :</strong> " + course.getCode() + "</li>" +
               "<li><strong>Filière :</strong> " + course.getMajor() + "</li>" +
               "<li><strong>Semestre :</strong> " + course.getSemester() + "</li>" +
               "</ul>" +
               "<p><strong>UPF University</strong></p>" +
               "</body></html>";
    }

    private String buildNewResource(User user, CourseResource resource,
                                     User prof) {
        return "<html><body>" +
               "<h2>Nouveau document disponible</h2>" +
               "<p>Bonjour " + user.getFirstName() + ",</p>" +
               "<p>Un nouveau document a été ajouté dans <strong>"
               + resource.getCourse().getTitle() + "</strong> :</p>" +
               "<ul>" +
               "<li><strong>Document :</strong> " + resource.getTitle() + "</li>" +
               "<li><strong>Ajouté par :</strong> "
               + prof.getFirstName() + " "
               + prof.getLastName() + "</li>" +
               "</ul>" +
               "<p><strong>UPF University</strong></p>" +
               "</body></html>";
    }

    private String buildAnnouncement(User user, Announcement announcement) {
        return "<html><body>" +
               "<h2>Nouvelle annonce</h2>" +
               "<p>Bonjour " + user.getFirstName() + ",</p>" +
               "<p><strong>" + announcement.getTitle() + "</strong></p>" +
               "<p>" + announcement.getContent() + "</p>" +
               "<p><em>Cours : " + announcement.getCourse().getTitle() + "</em></p>" +
               "<p><strong>UPF University</strong></p>" +
               "</body></html>";
    }

    private String buildNewMessage(User recipient, User sender, String preview) {
        return "<html><body>" +
               "<h2>Nouveau message</h2>" +
               "<p>Bonjour " + recipient.getFirstName() + ",</p>" +
               "<p><strong>" + sender.getFirstName() + " "
               + sender.getLastName() + "</strong> vous a envoyé un message :</p>" +
               "<blockquote>" + preview + "</blockquote>" +
               "<p>Connectez-vous pour répondre.</p>" +
               "<p><strong>UPF University</strong></p>" +
               "</body></html>";
    }

    private String buildNewFollower(User followed, User follower) {
        return "<html><body>" +
               "<h2>Nouveau follower</h2>" +
               "<p>Bonjour " + followed.getFirstName() + ",</p>" +
               "<p><strong>" + follower.getFirstName() + " "
               + follower.getLastName() + "</strong> suit maintenant votre profil.</p>" +
               "<p><strong>UPF University</strong></p>" +
               "</body></html>";
    }

    private String buildNewGroupMember(User owner, User newMember,
                                        AcademicGroup group) {
        return "<html><body>" +
               "<h2>Nouveau membre dans votre groupe</h2>" +
               "<p>Bonjour " + owner.getFirstName() + ",</p>" +
               "<p><strong>" + newMember.getFirstName() + " "
               + newMember.getLastName() + "</strong> a rejoint le groupe <strong>"
               + group.getName() + "</strong>.</p>" +
               "<p><strong>UPF University</strong></p>" +
               "</body></html>";
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private List<StudentProfile> getActiveStudents(Course course) {
        return enrollmentRepository
                .findByCourse_IdAndStatus(course.getId(), EnrollmentStatus.ACTIVE)
                .stream()
                .map(Enrollment::getStudentProfile)
                .toList();
    }
}