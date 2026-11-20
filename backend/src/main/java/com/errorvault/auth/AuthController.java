package com.errorvault.auth;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.security.MessageDigest;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    static final String COOKIE = "ev_session";

    private final AuthProperties properties;
    private final SessionTokens tokens;

    public AuthController(AuthProperties properties, SessionTokens tokens) {
        this.properties = properties;
        this.tokens = tokens;
    }

    /** Public: tells the app whether a login is required and whether this browser is signed in. */
    @GetMapping("/status")
    public Map<String, Boolean> status(HttpServletRequest request) {
        boolean authenticated = !properties.enabled() || tokens.isValid(AuthFilter.cookieValue(request, COOKIE), Instant.now());
        return Map.of("authRequired", properties.enabled(), "authenticated", authenticated);
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(@RequestBody Map<String, String> body) {
        if (!properties.enabled()) {
            return ResponseEntity.noContent().build();
        }
        String submitted = body == null ? null : body.get("password");
        if (submitted == null || !constantTimeEquals(submitted, properties.password())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Instant now = Instant.now();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie(tokens.create(now), Duration.ofDays(properties.sessionDays())).toString())
                .build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO).toString())
                .build();
    }

    private ResponseCookie cookie(String value, Duration maxAge) {
        return ResponseCookie.from(COOKIE, value)
                .httpOnly(true)
                .secure(properties.secureCookie())
                .sameSite("Strict")
                .path("/")
                .maxAge(maxAge)
                .build();
    }

    private static boolean constantTimeEquals(String a, String b) {
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}
