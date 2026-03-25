package com.upf.backend.application.services.Interfaces;
import com.upf.backend.application.model.enums.FileType;

public record StoredFileDescriptor(
  String relativePath,
        String publicUrl,
        String originalFilename,
        FileType fileType,
        long size
) {

}
