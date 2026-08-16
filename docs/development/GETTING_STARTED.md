# Getting Started with Samrat Client Development

## The Zero-Local-Toolchain Workflow

You do not need to install Java, Gradle, Rust, or Node.js on your local workstation.

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/samrat-client/launcher.git
   cd launcher
   ```
2. **Make Edits**:
   - Client code: `client/src/main/java/`
   - Launcher UI: `launcher/src/`
   - Launcher Rust Core: `launcher/src-tauri/src/`
3. **Push to GitHub**:
   - Push your branch to GitHub.
   - GitHub Actions will automatically execute all compilation, testing, static analysis, and packaging tasks.

## Optional Local Toolchain Usage

If you already have standard compilers installed locally, you can run tests directly:

### Java Client
```bash
cd client
./gradlew test
```

### Launcher (Rust & React)
```bash
cd launcher
npm install
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
```
