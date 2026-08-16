package com.samrat.diagnostics;

import java.util.regex.Pattern;

/**
 * Sanitizer strips sensitive credentials, tokens, and personally identifiable paths from all logs and crash dumps.
 */
public final class Sanitizer {
    private static final Pattern BEARER_TOKEN_PATTERN = Pattern.compile("(?i)(bearer\\s+)[a-zA-Z0-9_\\-\\.]+", Pattern.CASE_INSENSITIVE);
    private static final Pattern ACCESS_TOKEN_PATTERN = Pattern.compile("(?i)(\"?(?:access_token|accessToken|token|session|client_secret|password|secret)\"?\\s*[:=]\\s*\"?)[^\",\\s]+(\"?)", Pattern.CASE_INSENSITIVE);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+");
    private static final Pattern XBOX_XST_PATTERN = Pattern.compile("(?i)(XBL3\\.0\\s+x=)[^;\\s]+", Pattern.CASE_INSENSITIVE);

    public static String sanitize(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }

        String result = input;

        // 1. Scrub Bearer tokens
        result = BEARER_TOKEN_PATTERN.matcher(result).replaceAll("$1[REDACTED_TOKEN]");

        // 2. Scrub Access / Refresh / Session tokens & Passwords
        result = ACCESS_TOKEN_PATTERN.matcher(result).replaceAll("$1[REDACTED]$2");

        // 3. Scrub Xbox Live ticket
        result = XBOX_XST_PATTERN.matcher(result).replaceAll("$1[REDACTED_TICKET]");

        // 4. Scrub Email addresses
        result = EMAIL_PATTERN.matcher(result).replaceAll("[REDACTED_EMAIL]");

        // 5. Scrub User home directory paths
        String userHome = System.getProperty("user.home");
        if (userHome != null && !userHome.isEmpty()) {
            result = result.replace(userHome, "~");
        }

        return result;
    }

    private Sanitizer() {}
}
