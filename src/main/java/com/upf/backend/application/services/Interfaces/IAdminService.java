package com.upf.backend.application.services.Interfaces;

import com.upf.backend.application.model.entity.AdminProfile;
import com.upf.backend.application.model.entity.Enrollment;
import com.upf.backend.application.model.entity.ProfessorProfile;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.enums.AdminLevel;

import java.util.List;
import java.util.UUID;

public interface IAdminService {

    AdminProfile bootstrapInitialAdmin(String firstName,
                                       String lastName,
                                        String email,
                                       String rawPassword,
                                       AdminLevel adminLevel);

    AdminProfile createAdminAccount(String firstName,
                                    String lastName,
                                    String email,
                                    String rawPassword,
                                    AdminLevel adminLevel);

    AdminProfile promoteStudentToAdmin(UUID studentId,
                                       AdminLevel adminLevel);

    List<AdminProfile> listAdmins();

    AdminProfile getAdminProfile(UUID adminProfileId);

    AdminProfile updateAdminLevel(UUID adminProfileId,
                                  AdminLevel adminLevel);

    void revokeAdminRights(UUID adminProfileId);

    // Gestion professeurs
    ProfessorProfile createProfessorAccount(String firstName, String lastName,
                                             String email, String rawPassword,
                                             String department, String title,
                                             List<UUID> courseIds);
    ProfessorProfile assignCourseToProfessor(UUID professorId, UUID courseId);
    List<ProfessorProfile> listProfessors();

      // Gestion étudiants
    Enrollment enrollStudentToCourse(UUID studentId, UUID courseId);
    void unenrollStudentFromCourse(UUID studentId, UUID courseId);
    List<StudentProfile> listStudents();

}