package com.upf.backend.application.services;

import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.entity.User;
import com.upf.backend.application.model.enums.UserRole;
import com.upf.backend.application.repository.ProfessorRepository;
import com.upf.backend.application.repository.StudentRepository;
import com.upf.backend.application.repository.UserRepository;
import com.upf.backend.application.security.JwtService;
import com.upf.backend.application.security.SecurityUser;
import com.upf.backend.application.services.Exceptions.BusinessException;
import com.upf.backend.application.services.Exceptions.ResourceNotFoundException;
import com.upf.backend.application.services.Interfaces.AuthTokens;
import com.upf.backend.application.services.Interfaces.IAuthService;
import com.upf.backend.application.services.NotificationService;

import java.util.List;
import java.util.UUID;

import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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
    private final ProfessorRepository professorRepository;
    private final NotificationService notificationService;

    private final UserRepository userRepository;
    public AuthServiceImpl(StudentRepository studentRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtService jwtService,
                           UserRepository userRepository,
                           ProfessorRepository professorRepository,
                           NotificationService notificationService) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.professorRepository = professorRepository;
        this.notificationService = notificationService;
    }

    @Override
    public StudentProfile registerStudent(String firstName,
                                          String lastName,
                                          String email,
                                          String rawPassword,
                                          String major,
                                          int currentYear) {
        validateInstitutionalEmail(email);
        validatePassword(rawPassword);

        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException("Un compte existe déjà avec cet email.");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(UserRole.STUDENT);
        user.setActive(true);

       

        StudentProfile profile = new StudentProfile();
   
        
        profile.setMajor(major);
        profile.setCurrentYear(currentYear);
        profile.setProfilePublic(true);
        user.setStudentProfile(profile);// important : le helper method dans User gère la relation bidirectionnelle
         userRepository.save(user);
        notificationService.notifyWelcome(user);
        return profile;
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
                principal.getProfileId(),
                principal.getRole(),
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

    User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new ResourceNotFoundException("Compte introuvable."));

    // ✅ Switch sur l'enum pour profileId
    UUID profileId = switch (user.getRole()) {
        case STUDENT -> user.getStudentProfile() != null
                ? user.getStudentProfile().getId()
                : null;
        case ADMIN -> user.getAdminProfile() != null
                ? user.getAdminProfile().getId()
                : null;
        case PROFESSOR -> user.getProfessorProfile() != null
                ? user.getProfessorProfile().getId()
                : null;
        default -> null;
    };

    // ✅ Autorité depuis l'enum
    String authority = "ROLE_" + user.getRole().name();

    SecurityUser securityUser = new SecurityUser(
            user.getId(),
            profileId,
            user.getEmail(),
            user.getPasswordHash(),
            user.isActive(),
            user.getRole(),
            List.of(new SimpleGrantedAuthority(authority))
    );

    return new AuthTokens(
            jwtService.generateAccessToken(securityUser),
            jwtService.generateRefreshToken(securityUser),
            securityUser.getUserId(),
            securityUser.getProfileId(),
            securityUser.getRole(),
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