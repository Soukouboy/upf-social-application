package com.upf.backend.application.services.Exceptions;

public class BusinessException  extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }

}
