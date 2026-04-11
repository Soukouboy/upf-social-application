package com.upf.backend.application.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.messaging.MessagingException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.upf.backend.application.config.MailProperties;

import jakarta.mail.internet.MimeMessage;


@Service
public class EmailService {

     private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final JavaMailSender mailSender;
    private final MailProperties mailProperties;

    public EmailService(JavaMailSender mailSender, MailProperties mailProperties) {
        this.mailSender = mailSender;
        this.mailProperties = mailProperties;
    }



@Async
public void sendEmail(String to, String subject, String htmlContent) {
    try {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(mailProperties.getFrom(), "UPF Connect");  // Injecté depuis les variables d'env
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
        System.out.println("✅ Email envoyé à : {}"+ to);

    }
    catch (Exception e) {
       log.error("❌ Échec envoi à {} : {}", to, e.getMessage(), e);
    }
}


}