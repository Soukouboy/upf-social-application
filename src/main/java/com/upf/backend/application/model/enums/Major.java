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
}
