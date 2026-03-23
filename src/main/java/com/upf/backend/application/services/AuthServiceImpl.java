package com.upf.backend.application.services;

import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.entity.User;
import com.upf.backend.application.repository.StudentRepository;
import com.upf.backend.application.security.JwtService;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.Exceptions.BusinessException;
import com.upf.backend.application.services.Exceptions.ResourceNotFoundException;
import com.upf.backend.application.services.Interfaces.AuthTokens;
import com.upf.backend.application.services.Interfaces.IAuthService;

import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements IAuthService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthServiceImpl(StudentRepository studentRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtService jwtService) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
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
        profile.setProfilePublic(true);

        return studentRepository.save(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthTokens authenticate(String email, String rawPassword) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email.trim().toLowerCase(),
                        rawPassword
                )
        );

        SecurityUser principal = (SecurityUser) authentication.getPrincipal();

        return new AuthTokens(
                jwtService.generateAccessToken(principal),
                jwtService.generateRefreshToken(principal),
                principal.getUserId(),
                principal.getStudentId(),
                principal.getUsername()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AuthTokens refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BusinessException("Le refresh token est obligatoire.");
        }

        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new BusinessException("Le token fourni n'est pas un refresh token valide.");
        }

        String username = jwtService.extractUsername(refreshToken);

        StudentProfile profile = studentRepository.findByUser_Email(username)
                .orElseThrow(() -> new ResourceNotFoundException("Compte introuvable."));

        SecurityUser securityUser = new SecurityUser(
            profile.getUser().getId(),    
            profile.getId(),
                
                profile.getUser().getEmail(),
                profile.getUser().getPasswordHash(),
                profile.getUser().isActive(),
                java.util.List.of(() -> "ROLE_STUDENT")
        );

        return new AuthTokens(
                jwtService.generateAccessToken(securityUser),
                jwtService.generateRefreshToken(securityUser),
                securityUser.getUserId(),
                securityUser.getStudentId(),
                securityUser.getUsername()
        );
    }

    private void validateInstitutionalEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new BusinessException("L'email est obligatoire.");
        }
        if (!email.trim().toLowerCase().endsWith("@upf.ac.ma")) {
            throw new BusinessException("Seuls les emails @upf.ac.ma sont autorisés.");
        }
    }

    private void validatePassword(String rawPassword) {
        if (rawPassword == null || rawPassword.length() < 8) {
            throw new BusinessException("Le mot de passe doit contenir au moins 8 caractères.");
        }
    }
}