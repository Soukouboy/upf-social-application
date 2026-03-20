package com.upf.backend.application.services.Interfaces;


import org.springframework.core.io.Resource;

public interface IFileStorageService {

    StoredFileDescriptor storeExamFile(String originalFilename,
                                       String contentType,
                                       long size,
                                       byte[] content);

    StoredFileDescriptor storeCourseResource(String originalFilename,
                                             String contentType,
                                             long size,
                                             byte[] content);

    Resource loadAsResource(String relativePath);

    String generatePublicUrl(String relativePath);

}
