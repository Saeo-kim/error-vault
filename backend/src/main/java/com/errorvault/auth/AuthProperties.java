package com.errorvault.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Single-user password protection.
 * When {@code password} is blank, authentication is disabled (local development only).
 */
@ConfigurationProperties(prefix = "app.auth")
public record AuthProperties(String password, boolean secureCookie, int sessionDays) {

    public AuthProperties {
        if (sessionDays <= 0) {
            sessionDays = 30;
        }
    }

    public boolean enabled() {
        return password != null && !password.isBlank();
    }
}
