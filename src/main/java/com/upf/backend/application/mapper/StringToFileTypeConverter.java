package com.upf.backend.application.mapper;


import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import com.upf.backend.application.model.enums.FileType;

@Component
public class StringToFileTypeConverter implements Converter<String, FileType> {
    @Override
    public FileType convert(String source) {
        return FileType.valueOf(source.toUpperCase());
    }
}
