package com.upf.backend.application.dto.admin;


import java.util.UUID;

import com.upf.backend.application.model.enums.AdminLevel;
 
/**
 * Résumé d'un profil administrateur pour les listes.
 */
public record AdminProfileSummary(
    UUID id,
    String firstName,
    String lastName,
    AdminLevel adminLevel
) {}
