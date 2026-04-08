package com.upf.backend.application.controller.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UpdateProfileFormData {
    
    @JsonProperty("bio")
    private String bio;

    @JsonProperty("profilePhotoUrl")
    private String profilePhotoUrl;

    @JsonProperty("major")
    private String major;

    @JsonProperty("currentYear")
    private Integer currentYear;

    @JsonProperty("profilePublic")
    private Boolean profilePublic;

    // Constructeur par défaut
    public UpdateProfileFormData() {
    }

    // Constructeur complet
    public UpdateProfileFormData(String bio, String profilePhotoUrl, String major, Integer currentYear, Boolean profilePublic) {
        this.bio = bio;
        this.profilePhotoUrl = profilePhotoUrl;
        this.major = major;
        this.currentYear = currentYear;
        this.profilePublic = profilePublic;
    }

    // Getters et Setters
    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public Integer getCurrentYear() {
        return currentYear;
    }

    public void setCurrentYear(Integer currentYear) {
        this.currentYear = currentYear;
    }

    public Boolean getProfilePublic() {
        return profilePublic;
    }

    public void setProfilePublic(Boolean profilePublic) {
        this.profilePublic = profilePublic;
    }
}
