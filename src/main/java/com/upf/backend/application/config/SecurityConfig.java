package com.upf.backend.application.config;

import com.upf.backend.application.security.CustomUserDetailsService;
import com.upf.backend.application.security.JwtAuthenticationFilter;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          CustomUserDetailsService userDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http .cors(cors -> cors.configurationSource(corsConfigurationSource())) 
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .authorizeHttpRequests(auth -> auth

                // Swagger / springdoc
                .requestMatchers(
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs",
                    "/v3/api-docs/**"
                ).permitAll()

                // Auth publique
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/auth/**").permitAll()

                // Bootstrap admin initial
                .requestMatchers("/admin/bootstrap/initial").permitAll()

                // Admin
                .requestMatchers("/admin/**").hasAnyRole("SUPER_ADMIN", "ADMIN")

                // WebSocket — l'authentification JWT se fait au niveau STOMP (WebSocketConfig)
                // permettre l'accès HTTP pour le handshake initial de SockJS
                .requestMatchers("/ws", "/ws/**").permitAll()

                // Exemples endpoints métiers
                .requestMatchers(HttpMethod.GET, "/courses/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/exams/**").authenticated()

                // Optionnel pour éviter des 403 parasites sur /error
                .requestMatchers("/error").permitAll()

                // TOUJOURS à la fin
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration)
            throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }



    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

            // SecurityConfig.java — mettre à jour

          config.setAllowedOrigins(List.of(
        "http://localhost:5173",
        "https://upf-social-p3j27qav6-soukouboys-projects.vercel.app/", // ✅ URL exacte
        "https://upf-social.vercel.app/",  // ✅ si tu as un domaine custom
         "https://upf-social2.vercel.app/" 
    ));

        // ✅ Méthodes HTTP autorisées
        config.setAllowedMethods(List.of(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // ✅ Headers autorisés — Authorization obligatoire pour JWT
        config.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "Accept"
        ));

        // ✅ Permettre l'envoi du cookie/token dans les requêtes
        config.setAllowCredentials(true);

        // ✅ Durée du cache preflight (évite une requête OPTIONS à chaque fois)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // appliquer à tous les endpoints
        return source;
    }
}