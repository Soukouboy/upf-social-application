package com.upf.backend.application.services.Interfaces;


import com.upf.backend.application.model.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ICourseService {

    Page<Course> listCourses(String major,
                             Integer year,
                             Integer semester,
                             String search,
                             Pageable pageable);

    Course getCourseDetails(UUID courseId);


}
