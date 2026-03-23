package com.upf.backend.application.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class SecurityUser implements UserDetails {

    private final UUID userId;
    private final UUID studentId;
    private final String email;
    private final String passwordHash;
    private final boolean active;
    private final Collection<? extends GrantedAuthority> authorities;

    public SecurityUser(UUID userId,
                        UUID studentId,
                        String email,
                        String passwordHash,
                        boolean active,
                        Collection<? extends GrantedAuthority> authorities) {
        this.userId = userId;
        this.studentId = studentId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.active = active;
        this.authorities = authorities == null ? List.of() : authorities;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getStudentId() {
        return studentId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return active;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return active;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}