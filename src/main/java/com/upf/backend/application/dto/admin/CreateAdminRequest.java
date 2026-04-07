package com.upf.backend.application.dto.admin;

<<<<<<< HEAD
import com.upf.backend.application.model.enums.AdminLevel;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
=======
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.upf.backend.application.model.enums.AdminLevel;
>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164

/**
 * Requête de création d'un compte admin (POST /admin/accounts ou /admin/bootstrap/initial).
 */
public class CreateAdminRequest {
    
    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 80, message = "Le prénom doit faire entre 2 et 80 caractères")
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 80, message = "Le nom doit faire entre 2 et 80 caractères")
    private String lastName;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    @Size(max = 150, message = "L'email ne peut pas dépasser 150 caractères")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, max = 255, message = "Le mot de passe doit faire entre 8 et 255 caractères")
    private String password;

    private AdminLevel adminLevel;

    // Constructeurs
    public CreateAdminRequest() {}

    public CreateAdminRequest(String firstName, String lastName, String email, 
                             String password, AdminLevel adminLevel) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.adminLevel = adminLevel;
    }

    // Getters / Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public AdminLevel getAdminLevel() { return adminLevel; }
    public void setAdminLevel(AdminLevel adminLevel) { this.adminLevel = adminLevel; }
}
