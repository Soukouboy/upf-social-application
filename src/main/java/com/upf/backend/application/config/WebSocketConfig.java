package com.upf.backend.application.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.upf.backend.application.security.JwtService;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;

    public WebSocketConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")           // URL de connexion du frontend

                .setAllowedOriginPatterns("http://localhost:5173", "https://upf-social.vercel.app/")

                
                .withSockJS();                // fallback SockJS si WebSocket indispo
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Préfixe des destinations gérées par @MessageMapping
        registry.setApplicationDestinationPrefixes("/app");

        // Broker en mémoire pour :
        //  /topic  → messages de groupe (broadcast)
        //  /queue  → messages privés (un utilisateur)
        registry.enableSimpleBroker("/topic", "/queue");

        // Destination des messages privés
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // ✅ Intercepteur JWT — vérifie le token AVANT tout message
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                    MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null
                        && StompCommand.CONNECT.equals(accessor.getCommand())) {

                    String authHeader = accessor.getFirstNativeHeader("Authorization");

                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            String email = jwtService.extractUsername(token);
                            // Injecter l'identité dans la session STOMP
                            accessor.setUser(() -> email);
                        } catch (Exception e) {
                            throw new MessageDeliveryException("Token JWT invalide.");
                        }
                    }
                }
                return message;
            }
        });
    }
}