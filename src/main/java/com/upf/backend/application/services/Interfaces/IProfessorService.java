package com.upf.backend.application.services.Interfaces;

import java.util.List;
import java.util.UUID;

import com.upf.backend.application.model.entity.Announcement;
import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.model.entity.CourseResource;
import com.upf.backend.application.model.entity.Enrollment;
import com.upf.backend.application.model.entity.StudentProfile;
import com.upf.backend.application.model.enums.FileType;

public interface IProfessorService {


     Course assignCourse(UUID professorId, UUID courseId);
    Course removeCourse(UUID professorId, UUID courseId);

    // Étudiants
    List<StudentProfile> getStudentsInCourse(UUID professorId, UUID courseId);

    // Ressources
    CourseResource uploadResource(UUID professorId, UUID courseId, String title,
                                   String fileUrl, FileType fileType,
                                   Long fileSizeBytes, boolean isExternal);
    void deleteResource(UUID professorId, UUID resourceId);
    List<CourseResource> getResourcesByCourse(UUID professorId, UUID courseId);

    // Annonces
    Announcement createAnnouncement(UUID professorId, UUID courseId,
                                     String title, String content);
    void deleteAnnouncement(UUID professorId, UUID announcementId);
    List<Announcement> getAnnouncementsByCourse(UUID courseId);
    List<Course> getMyCourses(UUID professorId);
}

