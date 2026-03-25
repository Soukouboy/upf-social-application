package com.upf.backend.application.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.upf.backend.application.model.enums.UserRole;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class SecurityUser implements UserDetails {

    private final UUID userId;
    private final UUID profileId;
    private final String email;
    private final String passwordHash;
    private final boolean active;
    private UserRole role;
    private final Collection<? extends GrantedAuthority> authorities;

    public SecurityUser(UUID userId,
                        UUID profileId,
                        String email,
                        String passwordHash,
                        boolean active,
                        UserRole role,
                        Collection<? extends GrantedAuthority> authorities) {
        this.userId = userId;
        this.profileId = profileId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.active = active;
        this.role = role;
        this.authorities = authorities == null ? List.of() : authorities;
    }

    public UUID getUserId() {
        return userId;
    }

    public UserRole getRole() {
        return role;
    }

    public UUID getProfileId() {
        return profileId; // For now, we only have student profiles. This can be extended to return adminId if needed.
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