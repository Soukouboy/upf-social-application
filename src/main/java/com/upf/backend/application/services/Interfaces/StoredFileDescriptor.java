package com.upf.backend.application.services.Interfaces;

public record StoredFileDescriptor(
  String relativePath,
        String publicUrl,
        String originalFilename,
        String contentType,
        long size
) {

}
