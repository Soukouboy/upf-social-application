package com.upf.backend.application.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.messaging.MessagingException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.upf.backend.application.config.MailProperties;

 


@Service
 
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final RestTemplate restTemplate;

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${app.mail.from}")
    private String senderEmail;

    public EmailService() {
        this.restTemplate = new RestTemplate();
    }

    @Async
    public void sendEmail(String to, String subject, String htmlContent) {
        log.info("📧 Envoi email via API Brevo à : {}", to);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);

            // Corps de la requête API Brevo
            String body = """
                {
                  "sender": {
                    "name": "UPF Connect",
                    "email": "%s"
                  },
                  "to": [
                    { "email": "%s" }
                  ],
                  "subject": "%s",
                  "htmlContent": %s
                }
                """.formatted(
                    senderEmail,
                    to,
                    subject,
                    toJson(htmlContent)
            );

            HttpEntity<String> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    BREVO_API_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Email envoyé avec succès à : {}", to);
            } else {
                log.error("❌ Brevo API erreur {} : {}", response.getStatusCode(), response.getBody());
            }

        } catch (Exception e) {
            log.error("❌ Échec envoi email à {} : {}", to, e.getMessage(), e);
        }
    }

    // Échappe le HTML pour l'inclure dans le JSON
    private String toJson(String html) {
        return "\"" + html
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "")
                + "\"";
    }
}