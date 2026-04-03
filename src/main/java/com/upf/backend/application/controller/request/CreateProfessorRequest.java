package com.upf.backend.application.controller.request;

import java.util.List;
import java.util.UUID;

 
public record CreateProfessorRequest(
    String firstName,
    String lastName,
    String email,
    String password,
    String department,
    String title,
    List<UUID> courseIds
) {

}
