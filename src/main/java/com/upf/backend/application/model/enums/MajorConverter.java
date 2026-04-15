package com.upf.backend.application.model.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Convertisseur JPA pour l'enum Major.
 * Gère la conversion entre les valeurs stockées en base de données
 * (labels français) et l'enum Java.
 */
@Converter(autoApply = true)
public class MajorConverter implements AttributeConverter<Major, String> {

    /**
     * Convertit l'enum Major en String pour le stockage en base de données.
     * Stocke le label (ex: "Faculté des Sciences de l'Ingénieur")
     */
    @Override
    public String convertToDatabaseColumn(Major attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getLabel();
    }

    /**
     * Convertit la String de la base de données en enum Major.
     * Utilise Major.fromString() pour gérer intelligemment les conversions.
     */
    @Override
    public Major convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        try {
            return Major.fromString(dbData);
        } catch (IllegalArgumentException e) {
            // Log le problème mais retourner null plutôt que d'échouer
            System.err.println("Could not convert '" + dbData + "' to Major enum: " + e.getMessage());
            return null;
        }
    }
}
