package com.upf.backend.application.services.Interfaces;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.upf.backend.application.model.entity.Course;
import com.upf.backend.application.model.entity.Enrollment;

import java.util.List;
import java.util.UUID;

public interface ICourseService {

    Page<Course> listCourses(String major,
                             Integer year,
                             Integer semester,
                             String search,
                             Pageable pageable);

    Course getCourseDetails(UUID courseId);


    
    List<Course> getCoursesByMajor(String major);
    List<Course> getCoursesByProfessor(UUID professorId);
   

    // Inscriptions
    Enrollment enrollStudent(UUID courseId, UUID studentId);
    void unenrollStudent(UUID courseId, UUID studentId);
    List<Course> getCoursesForStudent(UUID studentId);
    boolean hasStudentAccess(UUID courseId, UUID studentId);

}
