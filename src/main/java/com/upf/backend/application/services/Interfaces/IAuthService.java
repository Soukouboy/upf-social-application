package com.upf.backend.application.services.Interfaces;

import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.enums.Major;

public interface IAuthService {

    
  StudentProfile registerStudent(String firstName,
                                   String lastName,
                                   String email,
                                   String rawPassword,
                                   Major major,
                                   int currentYear);

    AuthTokens authenticate(String email, String rawPassword);

    AuthTokens refreshToken(String refreshToken);


}
