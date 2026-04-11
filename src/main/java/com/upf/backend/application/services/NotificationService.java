package com.upf.backend.application.services;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.upf.backend.application.dto.WsNotification;
import com.upf.backend.application.model.entity.AcademicGroup;
import com.upf.backend.application.model.entity.Announcement;
import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.model.entity.CourseResource;
import com.upf.backend.application.model.entity.Enrollment;
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

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    // ── Couleurs de la charte graphique UPF Connect ───────────────────────────
    private static final String COLOR_PRIMARY    = "#4F46E5"; // Indigo
    private static final String COLOR_SECONDARY  = "#7C3AED"; // Violet
    private static final String COLOR_SUCCESS    = "#059669"; // Vert
    private static final String COLOR_WARNING    = "#D97706"; // Orange
    private static final String COLOR_BG         = "#F9FAFB"; // Gris clair
    private static final String COLOR_TEXT       = "#111827"; // Gris foncé
    private static final String COLOR_MUTED      = "#6B7280"; // Gris moyen
    private static final String APP_NAME         = "UPF Social";
    private static final String APP_URL          = "https://upf-social2.vercel.app";

    private final NotificationRepository notificationRepository;
    private final UserRepository         userRepository;
    private final EnrollmentRepository   enrollmentRepository;
    private final EmailService           emailService;
    private final WsNotificationSender   wsNotificationSender;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               EnrollmentRepository enrollmentRepository,
                               WsNotificationSender wsNotificationSender,
                               EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.userRepository         = userRepository;
        this.enrollmentRepository   = enrollmentRepository;
        this.wsNotificationSender   = wsNotificationSender;
        this.emailService           = emailService;
    }

    // =========================================================================
    // TRIGGERS — appelés depuis les services métier
    // =========================================================================

    @Async
    public void notifyWelcome(User user) {
        String subject = "🎓 Bienvenue sur " + APP_NAME + " !";
         log.info("🔔 notifyWelcome() exécuté pour : {}", user.getEmail());
        send(user, NotificationType.WELCOME, subject, buildWelcome(user));
    }

    @Async
    public void notifyAccountCreated(User professor, String rawPassword) {
        String subject = "🔐 Votre compte " + APP_NAME + " a été créé";
        send(professor, NotificationType.ACCOUNT_CREATED, subject,
             buildAccountCreated(professor, rawPassword));
    }

    @Async
    public void notifyEnrollment(StudentProfile student, Course course) {
        User user = student.getUser();
        String subject = "✅ Inscription confirmée — " + course.getTitle();
        send(user, NotificationType.ENROLLMENT_CONFIRMED, subject,
             buildEnrollment(user, course));
    }

    @Async
    public void notifyNewResource(CourseResource resource) {
        Course course = resource.getCourse();
        User prof     = resource.getUploadedBy();
        String subject = "📄 Nouveau document — " + course.getTitle();

        List<StudentProfile> students = getActiveStudents(course);
        students.forEach(student ->
            send(student.getUser(), NotificationType.NEW_RESOURCE,
                 subject, buildNewResource(student.getUser(), resource, prof))
        );
    }

    @Async
    public void notifyNewAnnouncement(Announcement announcement) {
        Course course = announcement.getCourse();
        List<StudentProfile> students = getActiveStudents(course);

        students.forEach(student -> {
            String subject = "📢 Annonce — " + course.getTitle();
            send(student.getUser(), NotificationType.NEW_ANNOUNCEMENT,
                 subject, buildAnnouncement(student.getUser(), announcement));

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

    @Async
    public void notifyNewMessage(User recipient, User sender, String messagePreview) {
        String subject = "💬 Nouveau message de "
                       + sender.getFirstName() + " " + sender.getLastName();
        send(recipient, NotificationType.NEW_MESSAGE, subject,
             buildNewMessage(recipient, sender, messagePreview));
    }

    @Async
    public void notifyNewFollower(User followed, User follower) {
        String subject = "👥 " + follower.getFirstName() + " " + follower.getLastName()
                       + " vous suit maintenant";
        send(followed, NotificationType.NEW_FOLLOWER, subject,
             buildNewFollower(followed, follower));
    }

    @Async
    public void notifyNewGroupMember(User groupOwner, User newMember, AcademicGroup group) {
        String subject = "🏫 " + newMember.getFirstName() + " a rejoint " + group.getName();
        send(groupOwner, NotificationType.NEW_GROUP_MEMBER, subject,
             buildNewGroupMember(groupOwner, newMember, group));
    }

    @Async
    public void notifyAdmins(String alertSubject, String alertMessage) {
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        admins.forEach(admin ->
            send(admin, NotificationType.ADMIN_ALERT, alertSubject,
                 buildAdminAlert(admin, alertSubject, alertMessage))
        );
    }

    // =========================================================================
    // GESTION DES NOTIFICATIONS
    // =========================================================================

    public List<Notification> getNotificationsForUser(UUID userId) {
        return notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadForUser(UUID userId) {
        return notificationRepository.findByRecipient_IdAndIsReadFalse(userId);
    }

    public long countUnread(UUID userId) {
        return notificationRepository.countByRecipient_IdAndIsReadFalse(userId);
    }

    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.isRead();
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(UUID userId) {
        List<Notification> unread = getUnreadForUser(userId);
        unread.forEach(Notification::isRead);
        notificationRepository.saveAll(unread);
    }

    @Async
    public void retryFailed() {
        notificationRepository.findByStatus(NotificationStatus.FAILED).forEach(n -> {
            emailService.sendEmail(
                n.getRecipient().getEmail(),
                n.getTitle(),
                n.getContent()
            );
            notificationRepository.save(n);
        });
    }

    // =========================================================================
    // MÉTHODE GÉNÉRIQUE D'ENVOI — utilise EmailService (Brevo / Spring Mail)
    // =========================================================================

    private void send(User user, NotificationType type, String subject, String htmlContent) {

        log.info("📨 send() appelé — type:{} pour:{}", type, user.getEmail());

        // 1. Persister en BDD
        Notification notification = new Notification();
        notification.setRecipient(user);
        notification.setType(type);
        notification.setTitle(subject);
        notification.setContent(subject);
        notification.setStatus(NotificationStatus.PENDING);
        Notification saved = notificationRepository.save(notification);

        // 2. Envoyer via EmailService (Brevo SMTP)
        try {
            emailService.sendEmail(user.getEmail(), subject, htmlContent);
            saved.markAsSent();
            log.info("✅ Notification envoyée à : {}", user.getEmail());
        } catch (Exception e) {
            saved.markAsFailed();
            log.error("❌ Échec envoi notification à {} : {}", user.getEmail(), e.getMessage());
        }

        notificationRepository.save(saved);
    }

    // =========================================================================
    // TEMPLATES HTML PROFESSIONNELS
    // =========================================================================

    // ── Wrapper commun ────────────────────────────────────────────────────────

    private String wrap(String accentColor, String icon, String title, String bodyContent) {
        return """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <title>%s</title>
            </head>
            <body style="margin:0;padding:0;background-color:%s;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:%s;padding:40px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:12px;overflow:hidden;
                                box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,%s,%s);
                                 padding:32px 40px;text-align:center;">
                        <div style="font-size:36px;margin-bottom:8px;">%s</div>
                        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;
                                   letter-spacing:-0.5px;">%s</h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">
                          %s
                        </p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:36px 40px;color:%s;font-size:15px;line-height:1.7;">
                        %s
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#F3F4F6;padding:24px 40px;text-align:center;
                                 border-top:1px solid #E5E7EB;">
                        <p style="margin:0 0 8px;color:%s;font-size:12px;">
                          Vous recevez cet email car vous êtes inscrit sur
                          <strong>%s</strong>.
                        </p>
                        <p style="margin:0;color:%s;font-size:11px;">
                          © 2025 %s · Université Polytechnique de France
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                title,
                COLOR_BG, COLOR_BG,
                accentColor, COLOR_SECONDARY,
                icon, title, APP_NAME,
                COLOR_TEXT,
                bodyContent,
                COLOR_MUTED, APP_NAME,
                COLOR_MUTED, APP_NAME
        );
    }

    private String btn(String url, String label, String color) {
        return """
            <div style="text-align:center;margin:28px 0;">
              <a href="%s"
                 style="background:%s;color:#ffffff;padding:14px 32px;border-radius:8px;
                        text-decoration:none;font-weight:600;font-size:15px;
                        display:inline-block;letter-spacing:0.3px;">
                %s
              </a>
            </div>
            """.formatted(url, color, label);
    }

    private String infoBox(String content, String borderColor) {
        return """
            <div style="background:#F8FAFF;border-left:4px solid %s;
                        border-radius:6px;padding:16px 20px;margin:20px 0;
                        font-size:14px;color:%s;">
              %s
            </div>
            """.formatted(borderColor, COLOR_TEXT, content);
    }

    private String badgeRow(String label, String value) {
        return """
            <tr>
              <td style="padding:8px 0;color:%s;font-size:13px;width:140px;">%s</td>
              <td style="padding:8px 0;font-weight:600;font-size:13px;color:%s;">%s</td>
            </tr>
            """.formatted(COLOR_MUTED, label, COLOR_TEXT, value);
    }

    // ── Bienvenue ─────────────────────────────────────────────────────────────

    private String buildWelcome(User user) {
        String body = """
            <p style="font-size:17px;font-weight:600;color:%s;margin:0 0 16px;">
              Bonjour %s, bienvenue dans la communauté ! 👋
            </p>
            <p style="color:%s;margin:0 0 20px;">
              Votre compte étudiant est désormais actif sur <strong>%s</strong>,
              la plateforme académique de votre université.
              Découvrez tout ce que vous pouvez faire dès maintenant :
            </p>
            <table cellpadding="0" cellspacing="0" width="100%%">
              <tr>
                <td style="padding:10px;background:#EEF2FF;border-radius:8px;
                           text-align:center;width:30%%;">
                  <div style="font-size:26px;">📚</div>
                  <div style="font-size:13px;font-weight:600;color:%s;margin-top:6px;">
                    Cours & Ressources
                  </div>
                </td>
                <td width="12"></td>
                <td style="padding:10px;background:#F0FDF4;border-radius:8px;
                           text-align:center;width:30%%;">
                  <div style="font-size:26px;">👥</div>
                  <div style="font-size:13px;font-weight:600;color:%s;margin-top:6px;">
                    Groupes Académiques
                  </div>
                </td>
                <td width="12"></td>
                <td style="padding:10px;background:#FFF7ED;border-radius:8px;
                           text-align:center;width:30%%;">
                  <div style="font-size:26px;">💬</div>
                  <div style="font-size:13px;font-weight:600;color:%s;margin-top:6px;">
                    Messagerie
                  </div>
                </td>
              </tr>
            </table>
            %s
            <p style="color:%s;font-size:13px;margin:20px 0 0;text-align:center;">
              Une question ? Contactez le support via la plateforme.
            </p>
            """.formatted(
                COLOR_PRIMARY,
                user.getFirstName(),
                COLOR_MUTED, APP_NAME,
                COLOR_PRIMARY, COLOR_SUCCESS, COLOR_WARNING,
                btn(APP_URL, "Accéder à ma plateforme →", COLOR_PRIMARY),
                COLOR_MUTED
        );
        return wrap(COLOR_PRIMARY, "🎓", "Bienvenue sur " + APP_NAME, body);
    }

    // ── Compte professeur créé ────────────────────────────────────────────────

    private String buildAccountCreated(User professor, String tempPassword) {
        String body = """
            <p style="font-size:17px;font-weight:600;color:%s;margin:0 0 16px;">
              Bonjour Pr. %s %s,
            </p>
            <p style="color:%s;margin:0 0 20px;">
              L'administration de <strong>%s</strong> a créé votre compte professeur.
              Voici vos informations de connexion :
            </p>
            %s
            <table cellpadding="0" cellspacing="0" width="100%%">
              %s
              %s
            </table>
            %s
            <p style="color:%s;font-size:13px;margin:20px 0 0;">
              ⚠️ Pour des raisons de sécurité, veuillez changer votre mot de passe
              dès votre première connexion.
            </p>
            """.formatted(
                COLOR_PRIMARY,
                professor.getFirstName(), professor.getLastName(),
                COLOR_MUTED, APP_NAME,
                infoBox("🔐 Conservez ces informations en lieu sûr et ne les partagez jamais.", COLOR_WARNING),
                badgeRow("📧 Email :", professor.getEmail()),
                badgeRow("🔑 Mot de passe :", tempPassword),
                btn(APP_URL + "/login", "Se connecter maintenant →", COLOR_PRIMARY),
                COLOR_MUTED
        );
        return wrap(COLOR_PRIMARY, "🔐", "Votre compte " + APP_NAME, body);
    }

    // ── Inscription à un cours ────────────────────────────────────────────────

    private String buildEnrollment(User user, Course course) {
        String body = """
            <p style="font-size:17px;font-weight:600;color:%s;margin:0 0 16px;">
              Inscription confirmée ✅
            </p>
            <p style="color:%s;margin:0 0 20px;">
              Bonjour %s, vous êtes maintenant inscrit au cours suivant.
              Retrouvez toutes les ressources et annonces directement sur la plateforme.
            </p>
            <div style="background:#F8FAFF;border-radius:10px;padding:20px 24px;margin:20px 0;">
              <table cellpadding="0" cellspacing="0" width="100%%">
                %s
                %s
                %s
                %s
              </table>
            </div>
            %s
            """.formatted(
                COLOR_PRIMARY,
                COLOR_MUTED,
                user.getFirstName(),
                badgeRow("📘 Cours :", course.getTitle()),
                badgeRow("🏷️ Code :", course.getCode()),
                badgeRow("🎓 Filière :", course.getMajor()),
                badgeRow("📅 Semestre :", String.valueOf(course.getSemester())),
                btn(APP_URL + "/courses", "Voir mes cours →", COLOR_SUCCESS)
        );
        return wrap(COLOR_SUCCESS, "✅", "Inscription confirmée", body);
    }

    // ── Nouveau document ──────────────────────────────────────────────────────

    private String buildNewResource(User user, CourseResource resource, User prof) {
        String body = """
            <p style="font-size:17px;font-weight:600;color:%s;margin:0 0 16px;">
              Un nouveau document est disponible 📄
            </p>
            <p style="color:%s;margin:0 0 20px;">
              Bonjour %s, votre professeur vient de déposer un nouveau document
              dans le cours <strong>%s</strong>.
            </p>
            <div style="background:#F8FAFF;border-radius:10px;padding:20px 24px;margin:20px 0;">
              <table cellpadding="0" cellspacing="0" width="100%%">
                %s
                %s
                %s
              </table>
            </div>
            %s
            """.formatted(
                COLOR_PRIMARY,
                COLOR_MUTED,
                user.getFirstName(),
                resource.getCourse().getTitle(),
                badgeRow("📄 Document :", resource.getTitle()),
                badgeRow("👨‍🏫 Déposé par :", prof.getFirstName() + " " + prof.getLastName()),
                badgeRow("📘 Cours :", resource.getCourse().getTitle()),
                btn(APP_URL + "/courses", "Accéder au document →", COLOR_PRIMARY)
        );
        return wrap(COLOR_PRIMARY, "📄", "Nouveau document disponible", body);
    }

    // ── Nouvelle annonce ──────────────────────────────────────────────────────

    private String buildAnnouncement(User user, Announcement announcement) {
        String body = """
            <p style="font-size:17px;font-weight:600;color:%s;margin:0 0 16px;">
              Nouvelle annonce dans %s 📢
            </p>
            <p style="color:%s;margin:0 0 12px;">Bonjour %s,</p>
            <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;
                        padding:20px 24px;margin:16px 0;">
              <p style="margin:0 0 8px;font-weight:700;font-size:16px;color:%s;">
                %s
              </p>
              <p style="margin:0;color:%s;font-size:14px;line-height:1.6;">
                %s
              </p>
            </div>
            %s
            """.formatted(
                COLOR_PRIMARY,
                announcement.getCourse().getTitle(),
                COLOR_MUTED,
                user.getFirstName(),
                COLOR_TEXT,
                announcement.getTitle(),
                COLOR_MUTED,
                announcement.getContent(),
                btn(APP_URL + "/courses", "Voir l'annonce complète →", COLOR_WARNING)
        );
        return wrap(COLOR_WARNING, "📢", "Nouvelle annonce", body);
    }

    // ── Nouveau message ───────────────────────────────────────────────────────

    private String buildNewMessage(User recipient, User sender, String preview) {
        String initials = String.valueOf(sender.getFirstName().charAt(0)).toUpperCase()
                        + String.valueOf(sender.getLastName().charAt(0)).toUpperCase();
        String body = """
            <p style="font-size:17px;font-weight:600;color:%s;margin:0 0 16px;">
              Vous avez reçu un message 💬
            </p>
            <p style="color:%s;margin:0 0 20px;">Bonjour %s,</p>
            <div style="display:flex;align-items:center;margin:0 0 16px;">
              <div style="width:44px;height:44px;border-radius:50%;background:%s;
                          color:#fff;font-weight:700;font-size:16px;text-align:center;
                          line-height:44px;display:inline-block;margin-right:12px;">
                %s
              </div>
              <div style="display:inline-block;vertical-align:middle;">
                <div style="font-weight:600;color:%s;">
                  %s %s
                </div>
                <div style="font-size:12px;color:%s;">vous a envoyé un message</div>
              </div>
            </div>
            <div style="background:#F3F4F6;border-radius:10px;padding:16px 20px;
                        margin:16px 0;font-style:italic;color:%s;font-size:14px;
                        border-left:3px solid %s;">
              « %s »
            </div>
            %s
            """.formatted(
                COLOR_PRIMARY,
                COLOR_MUTED, recipient.getFirstName(),
                COLOR_PRIMARY,
                initials,
                COLOR_TEXT,
                sender.getFirstName(), sender.getLastName(),
                COLOR_MUTED,
                COLOR_MUTED, COLOR_PRIMARY,
                preview,
                btn(APP_URL + "/messages", "Répondre au message →", COLOR_PRIMARY)
        );
        return wrap(COLOR_PRIMARY, "💬", "Nouveau message", body);
    }

    // ── Nouveau follower ──────────────────────────────────────────────────────

    private String buildNewFollower(User followed, User follower) {
        String initials = String.valueOf(follower.getFirstName().charAt(0)).toUpperCase()
                        + String.valueOf(follower.getLastName().charAt(0)).toUpperCase();
        String body = """
            <p style="font-size:17px;font-weight:600;color:%s;margin:0 0 16px;">
              Quelqu'un suit votre profil 👥
            </p>
            <p style="color:%s;margin:0 0 20px;">Bonjour %s,</p>
            <div style="text-align:center;margin:24px 0;">
              <div style="width:64px;height:64px;border-radius:50%;background:%s;
                          color:#fff;font-weight:700;font-size:22px;text-align:center;
                          line-height:64px;display:inline-block;margin-bottom:12px;">
                %s
              </div>
              <p style="margin:0;font-size:18px;font-weight:700;color:%s;">
                %s %s
              </p>
              <p style="margin:4px 0 0;color:%s;font-size:14px;">
                suit maintenant votre profil
              </p>
            </div>
            %s
            """.formatted(
                COLOR_PRIMARY,
                COLOR_MUTED, followed.getFirstName(),
                COLOR_SECONDARY,
                initials,
                COLOR_TEXT,
                follower.getFirstName(), follower.getLastName(),
                COLOR_MUTED,
                btn(APP_URL + "/profile", "Voir mon profil →", COLOR_SECONDARY)
        );
        return wrap(COLOR_SECONDARY, "👥", "Nouveau follower", body);
    }

    // ── Nouveau membre dans un groupe ─────────────────────────────────────────

    private String buildNewGroupMember(User owner, User newMember, AcademicGroup group) {
        String body = """
            <p style="font-size:17px;font-weight:600;color:%s;margin:0 0 16px;">
              Votre groupe accueille un nouveau membre 🏫
            </p>
            <p style="color:%s;margin:0 0 20px;">Bonjour %s,</p>
            <div style="background:#F0FDF4;border-radius:10px;padding:20px 24px;margin:20px 0;">
              <table cellpadding="0" cellspacing="0" width="100%%">
                %s
                %s
              </table>
            </div>
            %s
            """.formatted(
                COLOR_SUCCESS,
                COLOR_MUTED, owner.getFirstName(),
                badgeRow("👤 Nouveau membre :", newMember.getFirstName() + " " + newMember.getLastName()),
                badgeRow("🏫 Groupe :", group.getName()),
                btn(APP_URL + "/groups", "Gérer mon groupe →", COLOR_SUCCESS)
        );
        return wrap(COLOR_SUCCESS, "🏫", "Nouveau membre", body);
    }

    // ── Alerte admin ──────────────────────────────────────────────────────────

    private String buildAdminAlert(User admin, String alertSubject, String alertMessage) {
        String body = """
            <p style="font-size:17px;font-weight:600;color:#DC2626;margin:0 0 16px;">
              Alerte système ⚠️
            </p>
            <p style="color:%s;margin:0 0 20px;">Bonjour %s (Admin),</p>
            %s
            <p style="color:%s;font-size:14px;margin:16px 0 0;">
              Connectez-vous au panneau d'administration pour plus de détails.
            </p>
            %s
            """.formatted(
                COLOR_MUTED, admin.getFirstName(),
                infoBox("⚠️ <strong>" + alertSubject + "</strong><br/><br/>" + alertMessage, "#DC2626"),
                COLOR_MUTED,
                btn(APP_URL + "/admin", "Accéder au panneau admin →", "#DC2626")
        );
        return wrap("#DC2626", "⚠️", "Alerte système", body);
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