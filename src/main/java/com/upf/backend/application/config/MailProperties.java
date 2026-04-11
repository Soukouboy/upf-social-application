package com.upf.backend.application.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "app.mail")
@Component
public class MailProperties {

    private String from;

    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }
}