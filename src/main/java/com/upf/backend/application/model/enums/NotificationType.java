package com.upf.backend.application.model.enums;

public enum NotificationType {
 // Compte
    WELCOME,                // Création de compte

    // Cours & ressources
    ENROLLMENT_CONFIRMED,   // Admin inscrit un étudiant à un cours
    NEW_RESOURCE,           // Professeur uploade un document
    NEW_ANNOUNCEMENT,       // Professeur fait une annonce

    // Social
    NEW_MESSAGE,            // Message reçu (groupe ou privé)
    NEW_FOLLOWER,           // Quelqu'un te suit
    NEW_GROUP_MEMBER,       // Quelqu'un rejoint ton groupe

    // Admin
    ACCOUNT_CREATED,        // Admin crée un compte professeur
    ADMIN_ALERT             // Alertes système
}
