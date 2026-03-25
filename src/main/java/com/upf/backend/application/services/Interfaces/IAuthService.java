package com.upf.backend.application.services.Interfaces;

import com.upf.backend.application.model.entity.StudentProfile;

public interface IAuthService {

    
  StudentProfile registerStudent(String firstName,
                                   String lastName,
                                   String email,
                                   String rawPassword,
                                   String major,
                                   int currentYear);

    AuthTokens authenticate(String email, String rawPassword);

    AuthTokens refreshToken(String refreshToken);


}
