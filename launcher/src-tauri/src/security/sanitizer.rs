use regex::Regex;
use std::sync::LazyLock;

static BEARER_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)(bearer\s+)[a-zA-Z0-9_\-\.]+").unwrap()
});

static TOKEN_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"(?i)("?(?:access_token|accessToken|token|session|client_secret|password|secret)"?\s*[:=]\s*"?[^",\s]+"?)"#).unwrap()
});

static EMAIL_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+").unwrap()
});

/// Redacts sensitive tokens, passwords, and emails from all log messages.
pub fn sanitize_log(input: &str) -> String {
    let step1 = BEARER_REGEX.replace_all(input, "$1[REDACTED_BEARER]");
    let step2 = TOKEN_REGEX.replace_all(&step1, "[REDACTED_TOKEN_DATA]");
    let step3 = EMAIL_REGEX.replace_all(&step2, "[REDACTED_EMAIL]");
    step3.to_string()
}
