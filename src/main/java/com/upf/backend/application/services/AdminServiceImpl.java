package com.upf.backend.application.services;

import com.upf.backend.application.model.entity.AdminProfile;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.entity.User;
import com.upf.backend.application.model.enums.AdminLevel;
import com.upf.backend.application.repository.AdminProfileRepository;
import com.upf.backend.application.repository.StudentRepository;
import com.upf.backend.application.repository.UserRepository;
import com.upf.backend.application.services.Exceptions.BusinessException;
import com.upf.backend.application.services.Exceptions.ResourceNotFoundException;
import com.upf.backend.application.services.Interfaces.IAdminService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AdminServiceImpl implements IAdminService {

    private final AdminProfileRepository adminProfileRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminServiceImpl(AdminProfileRepository adminProfileRepository,
                            UserRepository userRepository,
                            StudentRepository studentRepository,
                            PasswordEncoder passwordEncoder) {
        this.adminProfileRepository = adminProfileRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AdminProfile bootstrapInitialAdmin(String email,
                                              String rawPassword,
                                              AdminLevel adminLevel) {
        if (adminProfileRepository.count() > 0) {
            throw new BusinessException("Le bootstrap initial est déjà effectué. Un administrateur existe déjà.");
        }

        validateAdminCreationData(email, rawPassword, adminLevel);

        String normalizedEmail = normalizeEmail(email);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException("Un utilisateur existe déjà avec cet email.");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setActive(true);

        User savedUser = userRepository.save(user);

        AdminProfile adminProfile = new AdminProfile();
        adminProfile.setUser(savedUser);
        adminProfile.setAdminLevel(adminLevel);

        return adminProfileRepository.save(adminProfile);
    }

    @Override
    public AdminProfile createAdminAccount(String email,
                                           String rawPassword,
                                           AdminLevel adminLevel) {
        validateAdminCreationData(email, rawPassword, adminLevel);

        String normalizedEmail = normalizeEmail(email);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException("Un utilisateur existe déjà avec cet email.");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setActive(true);

        User savedUser = userRepository.save(user);

        AdminProfile adminProfile = new AdminProfile();
        adminProfile.setUser(savedUser);
        adminProfile.setAdminLevel(adminLevel);

        return adminProfileRepository.save(adminProfile);
    }

    @Override
    public AdminProfile promoteStudentToAdmin(UUID studentId,
                                              AdminLevel adminLevel) {
        if (adminLevel == null) {
            throw new BusinessException("Le niveau admin est obligatoire.");
        }

        StudentProfile student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil étudiant introuvable."));

        if (student.getUser() == null) {
            throw new BusinessException("Le profil étudiant n'est pas lié à un compte utilisateur.");
        }

        UUID userId = student.getUser().getId();

        if (adminProfileRepository.existsByUser_Id(userId)) {
            throw new BusinessException("Cet utilisateur possède déjà un profil administrateur.");
        }

        AdminProfile adminProfile = new AdminProfile();
        adminProfile.setUser(student.getUser());
        adminProfile.setAdminLevel(adminLevel);

        return adminProfileRepository.save(adminProfile);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminProfile> listAdmins() {
        return adminProfileRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminProfile getAdminProfile(UUID adminProfileId) {
        return adminProfileRepository.findById(adminProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil administrateur introuvable."));
    }

    @Override
    public AdminProfile updateAdminLevel(UUID adminProfileId,
                                         AdminLevel adminLevel) {
        if (adminLevel == null) {
            throw new BusinessException("Le niveau admin est obligatoire.");
        }

        AdminProfile adminProfile = adminProfileRepository.findById(adminProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil administrateur introuvable."));

        adminProfile.setAdminLevel(adminLevel);

        return adminProfileRepository.save(adminProfile);
    }

    @Override
    public void revokeAdminRights(UUID adminProfileId) {
        AdminProfile adminProfile = adminProfileRepository.findById(adminProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil administrateur introuvable."));

        adminProfileRepository.delete(adminProfile);
    }

    private void validateAdminCreationData(String email,
                                           String rawPassword,
                                           AdminLevel adminLevel) {
        if (email == null || email.isBlank()) {
            throw new BusinessException("L'email est obligatoire.");
        }

        if (rawPassword == null || rawPassword.length() < 8) {
            throw new BusinessException("Le mot de passe doit contenir au moins 8 caractères.");
        }

        if (adminLevel == null) {
            throw new BusinessException("Le niveau admin est obligatoire.");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}