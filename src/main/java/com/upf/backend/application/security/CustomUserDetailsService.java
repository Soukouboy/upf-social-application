package com.upf.backend.application.security;
import com.upf.backend.application.repository.ProfessorRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.upf.backend.application.model.entity.AdminProfile;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.entity.User;
import com.upf.backend.application.repository.AdminProfileRepository;
import com.upf.backend.application.repository.StudentRepository;
import com.upf.backend.application.repository.UserRepository;
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final ProfessorRepository professorRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final AdminProfileRepository adminProfileRepository;

    public CustomUserDetailsService(UserRepository userRepository,
                                    StudentRepository studentRepository,
                                    AdminProfileRepository adminProfileRepository, ProfessorRepository professorRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.adminProfileRepository = adminProfileRepository;
        this.professorRepository = professorRepository;
    }

    @Override
public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    String normalizedEmail = username.trim().toLowerCase();

    User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable : " + username));

    // ✅ Pour SPRING SECURITY — préfixe ROLE_ obligatoire pour @PreAuthorize
    List<SimpleGrantedAuthority> authorities = List.of(
            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
    );

    // ✅ Pour TON CODE — profileId selon le rôle
    UUID profileId = switch (user.getRole()) {
        case STUDENT -> user.getStudentProfile() != null
                ? user.getStudentProfile().getId()
                : null;
        case ADMIN   -> user.getAdminProfile() != null
                ? user.getAdminProfile().getId()
                : null;
        case PROFESSOR -> user.getProfessorProfile() != null
                ? user.getProfessorProfile().getId()
                : null;        
    };

    // ✅ SecurityUser contient tout : ce que Spring veut + ce que toi tu veux
    return new SecurityUser(
            user.getId(),       // userId
            profileId,          // studentId ou adminId selon le rôle
            user.getEmail(),    // username pour Spring
            user.getPasswordHash(), // password pour Spring (BCrypt) 
            user.isActive(),    // isEnabled pour Spring
             user.getRole(),     // UserRole enum → pour ton code (AuthTokens)
            authorities         // ROLE_STUDENT ou ROLE_ADMIN pour @PreAuthorize
    );
}

    // ✅ Switch sur l'enum UserRole
    private UUID resolveProfileId(User user) {
        return switch (user.getRole()) {
            case STUDENT -> studentRepository.findByUser_Id(user.getId())
                    .map(StudentProfile::getId)
                    .orElse(null);
            case ADMIN -> adminProfileRepository.findByUser_Id(user.getId())
                    .map(AdminProfile::getId)
                    .orElse(null);
            case PROFESSOR -> professorRepository.findByUser_Id(user.getId())
                    .map(professor -> professor.getId())
                    .orElse(null); 
        };
    }

    // ✅ Autorité vient de l'enum, cas ADMIN garde la logique de niveau
    private List<SimpleGrantedAuthority> resolveAuthorities(User user) {
        return switch (user.getRole()) {
            case STUDENT -> List.of(new SimpleGrantedAuthority("ROLE_STUDENT"));
            case PROFESSOR -> List.of(new SimpleGrantedAuthority("ROLE_PROFESSOR"));
            case ADMIN -> adminProfileRepository.findByUser_Id(user.getId())
                    .map(adminProfile -> List.of(
                            new SimpleGrantedAuthority(mapAdminLevelToAuthority(adminProfile))
                    ))
                 
                    .orElse(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
        };
    }

    private String mapAdminLevelToAuthority(AdminProfile adminProfile) {
        if (adminProfile.getAdminLevel() == null) {
            return "ROLE_ADMIN";
        }
        return switch (adminProfile.getAdminLevel()) {
            case MODERATOR -> "ROLE_MODERATOR";
            default        -> "ROLE_ADMIN";
        };
    }
}