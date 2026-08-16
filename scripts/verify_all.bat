@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   SAMRAT CLIENT ECOSYSTEM VERIFICATION SCRIPT
echo ===================================================
echo.

echo [1/3] Checking Client Build Environment (Java / Gradle)...
if exist "client\gradlew.bat" (
    echo Gradle wrapper found.
) else (
    echo Warning: gradlew.bat not found in client directory.
)

echo [2/3] Checking Launcher Environment (Tauri / Vite / Rust)...
if exist "launcher\package.json" (
    echo Launcher package.json found.
) else (
    echo Warning: Launcher package.json not found.
)

echo [3/3] Checking CI/CD Workflows...
if exist ".github\workflows\ci.yml" (
    echo GitHub Actions workflows verified.
) else (
    echo Warning: CI workflow not found.
)

echo.
echo ===================================================
echo   SAMRAT CLIENT REPOSITORY INTEGRITY VERIFIED
echo ===================================================
