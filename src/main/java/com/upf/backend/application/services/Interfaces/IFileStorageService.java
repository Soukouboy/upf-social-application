package com.upf.backend.application.services.Interfaces;


import org.springframework.core.io.Resource;

import com.upf.backend.application.model.enums.FileType;

public interface IFileStorageService {

    StoredFileDescriptor storeExamFile(String originalFilename,
                                       FileType contentType,
                                       long size,
                                       byte[] content);

    StoredFileDescriptor storeCourseResource(String originalFilename,
                                             FileType contentType,
                                             long size,
                                             byte[] content);

    Resource loadAsResource(String relativePath);

    String generatePublicUrl(String relativePath);

}
