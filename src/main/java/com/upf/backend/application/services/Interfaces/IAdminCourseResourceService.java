package com.upf.backend.application.services.Interfaces;

import com.upf.backend.application.model.entity.CourseResource;
import com.upf.backend.application.model.enums.FileType;

import java.util.List;
import java.util.UUID;

public interface IAdminCourseResourceService {

    CourseResource uploadCourseResourceFile(UUID courseId,
                                            String title,
                                            String description,
                                            String originalFilename,
                                            FileType contentType,
                                            long size,
                                            byte[] content);

    CourseResource addExternalCourseResourceLink(UUID courseId,
                                                 String title,
                                                 String description,
                                                 String externalUrl);

    List<CourseResource> listCourseResources(UUID courseId);

    CourseResource getCourseResource(UUID courseId, UUID resourceId);

    void deleteCourseResource(UUID courseId, UUID resourceId);
}