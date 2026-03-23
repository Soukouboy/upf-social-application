package com.upf.backend.application.security;

import com.upf.backend.application.model.entity.AdminProfile;
import com.upf.backend.application.model.entity.User;
import com.upf.backend.application.repository.AdminProfileRepository;
import com.upf.backend.application.repository.StudentRepository;
import com.upf.backend.application.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final AdminProfileRepository adminProfileRepository;

    public CustomUserDetailsService(UserRepository userRepository,
                                    StudentRepository studentRepository,
                                    AdminProfileRepository adminProfileRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.adminProfileRepository = adminProfileRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalizedEmail = username.trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable : " + username));

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        // ROLE_STUDENT si l'utilisateur possède un profil étudiant
        if (studentRepository.existsByUser_Id(user.getId())) {
            authorities.add(new SimpleGrantedAuthority("ROLE_STUDENT"));
        }

        // ROLE_ADMIN ou ROLE_MODERATOR selon le profil admin
        adminProfileRepository.findByUser_Id(user.getId())
                .ifPresent(adminProfile -> authorities.add(
                        new SimpleGrantedAuthority(mapAdminLevelToAuthority(adminProfile))
                ));

        return new SecurityUser(
                user.getId(),
                extractStudentIdIfPresent(user.getId()),
                user.getEmail(),
                user.getPasswordHash(),
                user.isActive(),
                authorities
        );
    }

    private String mapAdminLevelToAuthority(AdminProfile adminProfile) {
        if (adminProfile.getAdminLevel() == null) {
            return "ROLE_ADMIN";
        }

        String levelName = adminProfile.getAdminLevel().name();

        if ("MODERATOR".equalsIgnoreCase(levelName)) {
            return "ROLE_MODERATOR";
        }

        return "ROLE_ADMIN";
    }

    private java.util.UUID extractStudentIdIfPresent(java.util.UUID userId) {
        return studentRepository.findByUser_Id(userId)
                .map(student -> student.getId())
                .orElse(null);
    }
}