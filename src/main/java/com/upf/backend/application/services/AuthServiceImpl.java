package com.upf.backend.application.services;
import com.upf.backend.application.services.Exceptions.*;
import com.upf.backend.application.services.Exceptions.AccessDeniedBusinessException;
import com.upf.backend.application.services.Interfaces.IAuthService;
import com.upf.backend.application.services.Interfaces.AuthTokens;
import com.upf.backend.application.services.Interfaces.JwtTokenService;

import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.entity.User;
import com.upf.backend.application.repository.StudentRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements IAuthService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthServiceImpl(StudentRepository studentRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenService jwtTokenService) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    @Override
    public StudentProfile registerStudent(String email,
                                          String rawPassword,
                                          String major,
                                          int currentYear) {
        validateInstitutionalEmail(email);
        validatePassword(rawPassword);

        String normalizedEmail = email.trim().toLowerCase();

        if (studentRepository.existsByUser_Email(normalizedEmail)) {
            throw new BusinessException("Un compte existe déjà avec cet email.");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setActive(true);

        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setMajor(major);
        profile.setCurrentYear(currentYear);

        // Hypothèse : StudentProfile cascade le persist vers User.
        // Sinon, injecter un UserRepository et sauver User explicitement.
        return studentRepository.save(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthTokens authenticate(String email, String rawPassword) {
        String normalizedEmail = email.trim().toLowerCase();

        StudentProfile profile = studentRepository.findByUser_Email(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Compte introuvable."));

        if (profile.getUser() == null || !profile.getUser().isActive()) {
            throw new AccessDeniedBusinessException("Compte désactivé.");
        }

        if (!passwordEncoder.matches(rawPassword, profile.getUser().getPasswordHash())) {
            throw new AccessDeniedBusinessException("Identifiants invalides.");
        }

        return jwtTokenService.generateTokens(profile.getId(), normalizedEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthTokens refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BusinessException("Le refresh token est obligatoire.");
        }
        return jwtTokenService.refreshTokens(refreshToken);
    }

    private void validateInstitutionalEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new BusinessException("L'email est obligatoire.");
        }
        if (!email.trim().toLowerCase().endsWith("@upf.ac.ma")) {
            throw new BusinessException("Seuls les emails institutionnels @upf.ac.ma sont autorisés.");
        }
    }

    private void validatePassword(String rawPassword) {
        if (rawPassword == null || rawPassword.length() < 8) {
            throw new BusinessException("Le mot de passe doit contenir au moins 8 caractères.");
        }
    }
}