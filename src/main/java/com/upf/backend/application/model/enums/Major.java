package com.upf.backend.application.model.enums;

public enum Major {
    FSI("Faculté des Sciences de l'Ingénieur"),
    FBS("Fès Business School"),
    FMD("Facultés de medecine dentaire"),
    FSPSTS("Faculté des sciences Paramédicales et techniques de santé"),
    ESMA("Ecole supérieure des métiers de l'architecture"),
    CAMPUS_RABAT("CAMPUS RABAT ISSI"),
    SCIENCES_PO("SCIENCES PO"),
    CRDEI("CENTRE DE RECHERCHE,DEVELOPPEMENT ,EXPERTISE ET INNOVATION"),
    CED("CENTRE DES ETUDES DOCTORALES"),
    CLCSS("CENTRE DE LANGUES,CULTURE ET SOFT-SKILLS");

    private final String label;

    Major(String label) { this.label = label; }
    public String getLabel() { return label; }

    /**
     * Convertit une chaîne (label ou code) en enum Major.
     * Gère les espaces et underscores automatiquement.
     */
    public static Major fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Major cannot be null or empty");
        }

        // Essayer d'abord comme enum constant (SCIENCES_PO)
        try {
            return Major.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            // Si ça échoue, essayer de trouver par label (SCIENCES PO)
            for (Major major : Major.values()) {
                if (major.label.equalsIgnoreCase(value.trim())) {
                    return major;
                }
            }
            // Si rien ne marche, essayer en remplaçant les espaces par des underscores
            try {
                return Major.valueOf(value.toUpperCase().trim().replace(" ", "_"));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Unknown major: " + value);
            }
        }
    }
}
