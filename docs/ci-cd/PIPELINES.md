# GitHub Actions CI/CD Pipeline Documentation

The Samrat Client ecosystem features 7 GitHub Actions workflows:

| Workflow | Triggers | Description |
| -------- | -------- | ----------- |
| `ci.yml` | Push/PR to `main` | Master test runner (Java Gradle test + Rust check/clippy/test + Vite build & TypeScript typecheck) |
| `client-build.yml` | Push on `client/**` | Matrix builds Java Client jar across JDK 8, 17, and 21 |
| `launcher-build.yml` | Push on `launcher/**` | Builds Windows x64 MSI installer and portable executable |
| `windows-release.yml` | Tag `v*.*.*` | Full release pipeline: compiles both client and launcher, computes SHA-256 sums, generates release notes, and publishes GitHub Release |
| `nightly.yml` | Cron (2:00 AM UTC) | Automated nightly verification and pre-release test builds |
| `codeql.yml` | Weekly & PRs | CodeQL SAST security scan for Java and TypeScript |
| `dependency-review.yml` | Pull Requests | Checks dependencies against known CVE advisory databases |
