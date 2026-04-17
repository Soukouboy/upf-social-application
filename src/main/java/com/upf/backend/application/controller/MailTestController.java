package com.upf.backend.application.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
 
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.upf.backend.application.model.entity.User;
import com.upf.backend.application.services.EmailService;
import com.upf.backend.application.services.NotificationService;
 
 @RestController
@RequestMapping("/test")
public class MailTestController {

    private final EmailService emailService;
    private final NotificationService notificationService;

    @Value("${app.mail.from}")
    private String senderEmail;

    public MailTestController(EmailService emailService, NotificationService notificationService) {
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    @GetMapping("/mail")
    public ResponseEntity<String> testMail() {
        try {
            emailService.sendEmail(
                "soukouna-dia@upf.ac.ma",
                "🧪 Test email UPF Connect",
                "<h1>Test OK !</h1><p>Le service mail fonctionne via API Brevo.</p>"
            );
            return ResponseEntity.ok("✅ Email envoyé avec succès !");

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("❌ Erreur : " + e.getMessage());
        }
    }

            @GetMapping("/mail-welcome")
        public ResponseEntity<String> testWelcome() {
            // Crée un User factice pour tester
            User fakeUser = new User();
            fakeUser.setFirstName("Test");
            fakeUser.setEmail("soukouna-dia@upf.ac.ma");
            notificationService.notifyWelcome(fakeUser);
            return ResponseEntity.ok("✅ Welcome email envoyé !");
        }


}