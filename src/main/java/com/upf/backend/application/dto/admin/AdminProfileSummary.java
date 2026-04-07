package com.upf.backend.application.dto.admin;

<<<<<<< HEAD
import java.util.UUID;

import com.upf.backend.application.model.enums.AdminLevel;
=======
import com.upf.backend.application.model.enums.AdminLevel;
import java.util.UUID;
>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164

/**
 * Résumé d'un profil administrateur pour les listes.
 */
public record AdminProfileSummary(
    UUID id,
    String firstName,
    String lastName,
    AdminLevel adminLevel
) {}
