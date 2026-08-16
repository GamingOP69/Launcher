package com.samrat;

import com.samrat.diagnostics.Sanitizer;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class SanitizerTest {

    @Test
    public void testTokenAndCredentialRedaction() {
        String logLine = "Connecting with accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and Bearer secret_12345";
        String sanitized = Sanitizer.sanitize(logLine);

        assertFalse(sanitized.contains("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"));
        assertFalse(sanitized.contains("secret_12345"));
        assertTrue(sanitized.contains("[REDACTED]"));
        assertTrue(sanitized.contains("[REDACTED_TOKEN]"));
    }

    @Test
    public void testEmailAndUserHomeRedaction() {
        String logLine = "Player logged in as user player@minecraft.net on /home/samrat/Desktop or C:\\Users\\samrat\\.samrat";
        String sanitized = Sanitizer.sanitize(logLine);

        assertFalse(sanitized.contains("player@minecraft.net"));
        assertTrue(sanitized.contains("[REDACTED_EMAIL]"));
    }
}
