package com.errorvault.auth;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

/**
 * Stateless session tokens: "{expiryEpochSeconds}.{HMAC-SHA256(expiry)}", keyed with the
 * configured password. Changing the password invalidates every existing session.
 */
@Component
public class SessionTokens {

    private final AuthProperties properties;

    public SessionTokens(AuthProperties properties) {
        this.properties = properties;
    }

    public String create(Instant now) {
        long expiry = now.plusSeconds(properties.sessionDays() * 86_400L).getEpochSecond();
        return expiry + "." + sign(String.valueOf(expiry));
    }

    public boolean isValid(String token, Instant now) {
        if (token == null || !properties.enabled()) {
            return false;
        }
        int dot = token.indexOf('.');
        if (dot <= 0) {
            return false;
        }
        String expiryPart = token.substring(0, dot);
        long expiry;
        try {
            expiry = Long.parseLong(expiryPart);
        } catch (NumberFormatException e) {
            return false;
        }
        boolean signatureOk = MessageDigest.isEqual(
                sign(expiryPart).getBytes(StandardCharsets.UTF_8),
                token.substring(dot + 1).getBytes(StandardCharsets.UTF_8));
        return signatureOk && now.getEpochSecond() < expiry;
    }

    private String sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(properties.password().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("HMAC-SHA256 unavailable", e);
        }
    }
}
