package com.upf.backend.application.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.messaging.MessagingException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;


@Service
public class EmailService {

    @Value("${spring.mail.username}")
    private String senderEmail;
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }



@Async
public void sendEmail(String to, String subject, String htmlContent) {
    try {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(senderEmail, "UPF Connect");  // Injecté depuis les variables d'env
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
        System.out.println("✅ Email envoyé à : {}"+ to);

    } catch (MailSendException e) {
        System.out.println("❌ Échec envoi SMTP à "+ to +" : "+ e.getMessage());
    } catch (MessagingException e) {
        System.out.println("❌ Erreur construction email : "+ e.getMessage());
    }
    catch (Exception e) {
        System.out.println("❌ Erreur inattendue lors de l'envoi de l'email à "+ to +" : "+ e.getMessage());
    }
}
}

