package com.upf.backend.application.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.mail.internet.MimeMessage;

@RestController
@RequestMapping("/test")
public class MailTestController {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String senderEmail;

    public MailTestController(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @GetMapping("/mail")
    public ResponseEntity<String> testMail() {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, "UPF Connect");
            helper.setTo("soukounadiadia6@gmail.com"); // S'envoie à toi-même pour tester
            helper.setSubject("🧪 Test email UPF Connect");
            helper.setText("<h1>Test OK !</h1><p>Le service mail fonctionne.</p>", true);

            mailSender.send(message);
            return ResponseEntity.ok("✅ Email envoyé avec succès !");

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("❌ Erreur : " + e.getMessage() + "\n\nCause : "
                          + (e.getCause() != null ? e.getCause().getMessage() : "inconnue"));
        }
    }
}
