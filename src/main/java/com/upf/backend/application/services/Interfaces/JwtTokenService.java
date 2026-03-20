package com.upf.backend.application.services.Interfaces;

import java.util.UUID;
public interface JwtTokenService {

    
  AuthTokens generateTokens(UUID studentId, String email);

    AuthTokens refreshTokens(String refreshToken);

} 
