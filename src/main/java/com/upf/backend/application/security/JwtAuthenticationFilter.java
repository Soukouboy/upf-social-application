package com.upf.backend.application.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.core.context.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();

        return path.startsWith("/swagger-ui")
            || path.startsWith("/v3/api-docs")
            || path.equals("/swagger-ui.html")
            || path.startsWith("/api/auth/")
            || path.startsWith("/auth/")
            || path.equals("/admin/bootstrap/initial")
            || path.endsWith("/error")
            ;
    }

 

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String method = request.getMethod();
        final String path = request.getServletPath();

        // Log pour diagnostiquer
        logger.debug("[JWT] {} {} | Header Authorization: {}", method, path, authHeader != null ? "Present" : "ABSENT");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("[JWT] ⚠️ No valid Bearer token for {} {}", method, path);
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            final String username = jwtService.extractUsername(jwt);
            final String tokenType = jwtService.extractTokenType(jwt);

            logger.debug("[JWT] ✓ Token extracted for user: {} | Type: {}", username, tokenType);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtService.isTokenValid(jwt, userDetails) && jwtService.isAccessToken(jwt)) {
                    logger.info("[JWT] ✓ Token valid & is ACCESS token for: {}", username);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContext context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(authentication);
                    SecurityContextHolder.setContext(context);
                } else {
                    logger.warn("[JWT] ❌ Token invalid or not an ACCESS token | isValid={} | isAccessToken={}", 
                            jwtService.isTokenValid(jwt, userDetails), 
                            jwtService.isAccessToken(jwt));
                }
            }
        } catch (Exception ex) {
            logger.error("[JWT] ❌ Exception processing token: {}", ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}