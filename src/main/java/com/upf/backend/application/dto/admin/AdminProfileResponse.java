package com.upf.backend.application.dto.admin;

<<<<<<< HEAD
import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.AdminLevel;

=======
import com.upf.backend.application.model.enums.AdminLevel;
import java.time.LocalDateTime;
import java.util.UUID;

>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164
/**
 * Réponse pour un profil administrateur.
 * Utilisée pour les endpoints de détail.
 */
public record AdminProfileResponse(
    UUID id,
    UUID userId,
    String email,
    String firstName,
    String lastName,
    AdminLevel adminLevel,
    LocalDateTime lastActionAt
) {}
