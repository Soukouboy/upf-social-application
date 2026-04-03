package com.upf.backend.application.controller.request;

import com.upf.backend.application.model.enums.FileType;

public record UploadResourceRequest(String title, String fileUrl,
                                     FileType fileType, Long fileSizeBytes,
                                     boolean isExternal) {}
