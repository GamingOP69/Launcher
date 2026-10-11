# MASTER PROMPT — Repair, Secure, and Complete SAMRAT Launcher + Minecraft 1.8.9 Client

Copy this entire prompt into the coding agent that has write access to `GamingOP69/Launcher`. Use `SAMRAT_LAUNCHER_AUDIT_AND_REMEDIATION_PLAN.md` as an initial findings index only. It is not ground truth: independently verify every finding in the checked-out source, correct anything stale or unsupported, and search for additional issues before implementation.

> **Repository evidence correction (2026-10-11):** GitHub has published releases, including `v1.0.18` and a `samrat-client-1.8.9.jar` asset. The earlier audit statement that the Releases page was empty was inaccurate. The checked-out source still builds a Swing `Main-Class`, and a published JAR does not establish a real Minecraft integration. Treat artifact availability, integrity, and runtime behavior as separate findings.

> **Current verified state (2026-10-11):** Windows package run [38150592212](https://github.com/GamingOP69/Launcher/actions/runs/38150592212) on `68ba5d8` passed clean NSIS installation, actual vanilla Minecraft 1.8.9 window startup, bounded survival, launcher/child process termination, and uninstall under CI-only Mesa software OpenGL. Rust/frontend CI and CodeQL passed on this commit; Client Matrix passed on `d788393` and includes Forge development main-menu smoke. Tauri still launches vanilla only; Forge and QoL features are not installed by the package. Microsoft authentication, packaged UI settings restart verification, dependency alert remediation, protected-tag settings verification, performance comparison, and physical Windows GPU/gameplay validation remain open. Use the live evidence ledger at `docs/REMEDIATION_STATUS.md`; older notes below are historical unless superseded by a later dated update.

> **Settings persistence update (2026-10-11):** Added versioned `.samrat/launcher-settings.json` load/save, debounced UI writes, bounded values, fail-visible parse errors, and regression tests for defaults, round-trips, bounds, and corrupt files. Linux Rust/frontend checks and Windows Rust tests/package build passed on `68ba5d8` ([38150592175](https://github.com/GamingOP69/Launcher/actions/runs/38150592175), [38150592212](https://github.com/GamingOP69/Launcher/actions/runs/38150592212)). The packaged UI has not yet been driven through a settings save/restart/reload smoke.

> **Remediation update (2026-10-11):** The fake tweaker/transformer and their misleading manifest claims were removed; the old Java artifact is explicitly a Swing preview. A genuine Forge 1.8.9 mod smoke passed in Actions on `784b321`. A separate vanilla installer now derives files from Mojang version metadata and verifies SHA-1/size, allowlisted HTTPS hosts, stages downloads, and constrains native extraction. CI passed for this installer on `0872896`; that result is not a packaged Tauri launch. Subsequent source changes connect install and local-profile process launch commands; the new code awaits Actions validation and launcher-driven main-menu evidence. Consult `docs/REMEDIATION_STATUS.md` before treating any capability as complete.

> **Account-storage update (2026-10-11):** The current source no longer creates a default local profile, and clears access/refresh tokens before account JSON persistence or when loading old files. Rust regression tests for persistence passed on `a889474`; additional launch-boundary tests are in the latest CI. No OS credential vault or complete Microsoft/Xbox/Minecraft session flow is integrated; online account launch remains unsupported. Local profiles launch with an empty token and cannot authenticate to online-mode servers.

> **Path-security update (2026-10-11):** Existing-file checks for update verification now canonicalize the data root and target to reject symlink escapes. Regression tests passed in Actions on `a889474` ([38138140281](https://github.com/GamingOP69/Launcher/actions/runs/38138140281)). This check has a remaining time-of-check/time-of-use race and Windows reparse-point behavior still needs validation.

---

> **Process-race update (2026-10-11):** A launch reservation prevents concurrent `LauncherEngine` calls from entering runtime preparation; its regression test passed in Actions on `a889474` ([38138140281](https://github.com/GamingOP69/Launcher/actions/runs/38138140281)).

> **Forge smoke evidence (2026-10-11):** Earlier display setup and missing-`glxinfo` failures were fixed. Forge build, verified asset staging, and real Minecraft 1.8.9 main-menu smoke passed on `784b321` ([38138523392](https://github.com/GamingOP69/Launcher/actions/runs/38138523392)) and `75275ad` ([38140851703](https://github.com/GamingOP69/Launcher/actions/runs/38140851703)) under software OpenGL. This does not prove Tauri-driven startup or physical GPU/gameplay behavior.

> **Package-launch investigation (2026-10-11):** Windows package run [38143300161](https://github.com/GamingOP69/Launcher/actions/runs/38143300161) initially failed closed because `launcher.mojang.com` was missing from the legacy artifact allowlist. That regression passed CI on `b3c1903`; the package then installed and ran Mojang's 1.8.9 `Main` under Java 8. The hosted Windows VM lacks a usable OpenGL context, as recorded in [38145836336](https://github.com/GamingOP69/Launcher/actions/runs/38145836336), so Minecraft exits before a window. The first pinned Mesa `llvmpipe` retry failed on path quoting before game launch in [38146898834](https://github.com/GamingOP69/Launcher/actions/runs/38146898834); the path fix awaits Actions. Microsoft-account launch remains unavailable pending secure credentials and complete authentication.
> **Packaged game window evidence (2026-10-11):** Package run [38147574400](https://github.com/GamingOP69/Launcher/actions/runs/38147574400) on `c45f217` installed the launcher and observed a real `Minecraft 1.8.9` window from the launched Mojang game process, using CI-only Mesa software OpenGL. The job failed after window detection because the harness waited 35 seconds while the launcher smoke window lasts 90 seconds. The wait and child cleanup checks are corrected in the current workflow; full smoke validation is still pending. This is not physical GPU or gameplay evidence.
> **Smoke harness recheck (2026-10-11):** Run [38148402109](https://github.com/GamingOP69/Launcher/actions/runs/38148402109) again installed the package and observed the real game window, but the launcher had not exited after an 80-second harness wait; Actions cleaned up both orphan launcher and Java processes. The harness timeout has been increased to 120 seconds, with an explicit child-exit assertion. The next Actions run must pass before the package smoke is called successful.
> **Passing package launch smoke (2026-10-11):** Windows run [38150592212](https://github.com/GamingOP69/Launcher/actions/runs/38150592212) passed the clean package install, actual `Minecraft 1.8.9` window observation, bounded process-survival check, launcher-initiated termination, Java child exit, and NSIS uninstall. The commit-specific Windows artifact was uploaded. This validates the vanilla launch pipeline under CI software OpenGL. The package does not yet install Forge or QoL features; physical GPU and gameplay checks remain outstanding.

> **Forge product integration correction (2026-10-11):** The later source now wires a pinned Forge 1.8.9 runtime and bundled Samrat mod into the launcher package path; therefore “Tauri still launches vanilla only” above is historical, not current source status. The first Forge package attempt failed on an invalid `.jar.sha1` URL and a subsequent probe failed on an incorrect SHA-1. Commit `352b6b3` corrected the universal artifact SHA-1 against Forge's published page and adds verified-cache handling, but its Actions results and clean packaged Forge main-menu/mod-marker smoke are pending. The successful vanilla run above is not evidence for the Forge package. Release workflow still publishes without a clean install/game smoke of its own build; see `REL-001` in `docs/REMEDIATION_STATUS.md`.

> **Release pipeline correction (2026-10-11):** Source now shares `scripts/smoke_installed_launcher.ps1` between branch package validation and stable-tag validation. The release job runs it against the exact packaged NSIS setup before publishing and captures smoke logs. `scripts/package_release.py` now stages only the one NSIS installer and one MSI, rejects missing/ambiguous outputs and stale/symlinked dist output, writes SHA-256 plus a machine-readable manifest, and no longer publishes Java preview JARs. Regression tests and end-to-end workflow validation are pending Actions for the current commit. Repository tag protection and variables still need maintainer verification.

> **Updater security correction (2026-10-11):** The updater command was still willing to fetch unsigned JSON, while its caller supplied a hardcoded version. It now returns an explicit unavailable error for supported channels until signed manifests, a trusted embedded public key, and the installed package version source are implemented. Regression coverage is pending Actions; updater functionality is intentionally unavailable meanwhile.

> **Revalidation update (2026-10-11):** Commit `b3c1903` passed Continuous Integration [38143874912](https://github.com/GamingOP69/Launcher/actions/runs/38143874912) and Client Matrix [38143874936](https://github.com/GamingOP69/Launcher/actions/runs/38143874936), including Rust regressions and the Forge development main-menu smoke. CodeQL [38143874921](https://github.com/GamingOP69/Launcher/actions/runs/38143874921) and the Windows package/game smoke [38143874923](https://github.com/GamingOP69/Launcher/actions/runs/38143874923) remain in progress. The actual packaged launcher launch is still unverified.

## ROLE AND MISSION

You are acting as a staff-level desktop/launcher engineer, Minecraft Java 1.8.9 mod engineer, Rust/Tauri security engineer, React/TypeScript UX engineer, and CI/supply-chain engineer. Your task is to **make actual changes in this repository**, not just write recommendations. Fix the code and workflows in small verified phases so that `GamingOP69/Launcher` becomes a safe, reliable, maintainable launcher for a real Minecraft Java Edition 1.8.9 client with legitimate visual/PvP QoL features.

Read and inventory the full repository before changing it. Treat `SAMRAT_LAUNCHER_AUDIT_AND_REMEDIATION_PLAN.md` as a findings index, not as a substitute for verifying the current code. Verify every issue against the checked-out code, report anything that does not reproduce, discover additional defects, and keep a `docs/REMEDIATION_STATUS.md` updated with each finding, its evidence, commit/PR reference, tests and residual risks.

**Do not claim Lunar/Feather superiority, guaranteed FPS gains, complete security, or “everything fixed” without reproducible evidence.** The actual target is correct behavior, low overhead, real telemetry, safe defaults, and a reproducible release pipeline. Do not clone proprietary art/branding.

## NON-NEGOTIABLE PRODUCT BOUNDARIES

1. Target **Minecraft Java Edition 1.8.9** and PvP/Bedwars quality-of-life features first.
2. Preserve Minecraft's real authentication boundary. Local offline profiles may be offered for single-player and servers that explicitly allow offline-mode accounts; they must never impersonate a Microsoft account, forge tokens, bypass entitlement checks, or be presented as valid for online-mode servers such as Hypixel. If online account support is included, implement the supported Microsoft/Xbox/Minecraft authentication and entitlement flow using secure token storage; otherwise keep the online account path explicitly unsupported. Never claim an offline profile can join an authenticated server.
3. All in-game additions must be client-side and fair-play: HUD, input display, crosshair, legitimate animations, keybinds, configuration, resource packs, visual customization, and measured optimizations. Do not implement combat cheats, server-side changes, anticheat bypass/evasion, aim/reach/velocity manipulation, or packet abuse. Verify server rules for any chat automation and remove/disable it if it is not appropriate.
4. The user requires builds to run through GitHub Actions, not on their PC. **Do not run local build/test/package commands.** Use read-only local inspection and edits, then use GitHub Actions/`gh` to dispatch or inspect workflow runs when authenticated and authorized. If credentials or permissions are unavailable, leave changes ready for CI and state that limitation; never imply a CI run succeeded without observing its result. Publish commit-specific downloadable Actions artifacts for pushes and pull requests.
5. Never suppress, swallow, or paper over a failing critical build/test. Never make a fake Swing simulation appear to be a real Minecraft launch.
6. Do not broadly rewrite the whole project in a new language. Fix the architecture with minimal justified changes and tests.
7. Protect existing user data where possible. Add migrations/backups for config changes, never delete worlds/accounts/configs indiscriminately, and do not wipe the user's game folder during an update.
8. Treat current README, SECURITY.md, and architecture/security docs as claims to verify, not proof. Correct documentation wherever it promises behavior the implementation does not provide. Replace dead vulnerability-reporting addresses with a monitored route or remove them.

## REQUIRED FIRST ACTIONS: RECON AND DESIGN DECISION

Before touching implementation:

1. Confirm repository root, branch, HEAD SHA, uncommitted files, current workflow status and available build tools.
2. Enumerate source, config, tests, workflows, release scripts, assets and generated artifacts. Exclude build outputs/`node_modules` from source scans. Search for TODO/FIXME, mocks, hardcoded URLs, secrets/tokens, `unwrap`/`expect`, panics, unchecked path joins, arbitrary download URLs, hardcoded metrics, swallowed errors, dead code, duplicated classes, unbounded collections and network/file I/O in hot paths.
3. Read every file that belongs to the affected launch, installer, mod integration, auth/profile/config, updater, frontend bridge and CI paths. Follow actual call paths; do not infer functionality from class names or README claims.
4. Record a small architecture diagram and current failure root causes in `docs/REMEDIATION_STATUS.md`.
5. Make a **minimal proof of concept** that builds/loads into an actual Minecraft 1.8.9 client before implementing numerous features. Choose the loader after verifying official primary sources and a functioning CI toolchain:
   - Preferred initial candidate: real Forge 1.8.9 mod built against the Forge 1.8.9 MDK/API and compatible historical toolchain.
   - Alternative: correct LaunchWrapper/ASM/Mixin integration only if you prove why Forge is unsuitable.
   - Do not invent an interface or assume that a JAR `TweakClass` manifest entry activates code. Implement the exact loader contract for the chosen version.
   - Keep old ForgeGradle/Gradle/Java tooling isolated if it cannot coexist with the modern root Gradle. Do not blindly upgrade legacy build plugins to Gradle 8.5. Prove a reproducible runner and artifact before making the choice final.
6. Preserve the mock Swing UI only as an explicitly marked preview if useful for design. It must not be used as a fallback for a failed game install/launch.

## ARCHITECTURE TO AIM FOR

- **Rust/Tauri native backend:** game metadata retrieval/verification, safe library/asset/native installation, Java detection, process lifecycle, secure updates, filesystem guards, diagnostics and event streaming.
- **React/TypeScript launcher UI:** game profile selection, account/local offline profile manager, resource-pack/mod catalog, settings, launch progress, diagnostics, log viewer and visual polish.
- **Java 1.8.9 mod:** real in-game HUD, click GUI, input/render hooks, actual world/player/network telemetry, compatibility layer and legitimate visual/performance functions.
- **One versioned config schema:** stable machine-readable module IDs shared between React/Rust/Java; UI labels must not be used as persistence keys.
- **One authoritative Minecraft installation model:** selected game version + loader version + libraries + assets + natives + mod/resource pack compatibility all derive from versioned metadata and validated manifests.
- **Clear state machine:** Idle, CheckingJava, ResolvingVersion, Downloading, Verifying, Preparing, Starting, GameRunning, Exited, Failed. State transitions are emitted to the UI with structured error codes, sanitized text and retry guidance.

## P0 — ACTUAL MINECRAFT INTEGRATION (DO FIRST)

The present client JAR behaves like a standalone Swing application; the launcher starts vanilla `net.minecraft.client.main.Main` while the Java artifact's manifest entry is not wired into a real LaunchWrapper loader. Fix the root cause, not just the log message.

1. Wire in the real 1.8.9 mod-loader entrypoint and its official compatible dependencies; create the module registry during the actual game lifecycle.
2. Ensure events such as client tick, render 2D/3D, keyboard, mouse, world/player update and connection status originate from real 1.8.9 game APIs/loader hooks. Remove no-op events or mark them unsupported until connected.
3. Make `RightShiftClickGUI` a real in-game screen/keybind; ensure it behaves correctly while chat/text fields have focus and doesn't open repeatedly from key-repeat.
4. Remove production use of `StandaloneClientWindow`. A missing/corrupt runtime must raise an error and show install/repair/log options—not start a fake scene.
5. Add an integration marker/log proving the mod was loaded by the game, tied to the client version and loader. The launcher must not mark launch successful solely because the OS spawned a process.
6. Consolidate duplicate shared event classes under one module. Ensure no duplicate fully qualified classes can silently win/lose based on classpath order.
7. Add a minimal reliable smoke test that demonstrates launch to the real Minecraft main menu on a clean Windows runner or a dedicated runner that supports the game. If that cannot be automated because of graphics/session limits, clearly separate the automated package/startup checks from required manual GPU smoke testing, and never claim that CI verified actual gameplay.

### P0 acceptance tests

- A clean artifact launches actual vanilla/Forge 1.8.9 rather than Swing.
- Mod bootstrap log appears inside the Minecraft process.
- A missing/invalid loader dependency causes a clear failure, not fake gameplay.
- Right Shift opens the actual in-game click GUI.
- At least one minimal HUD element renders actual data in a real world.

## P0 — SECURE INSTALLER / MOD DOWNLOADER

### Minecraft runtime install

1. Replace hardcoded incomplete library lists with the selected Minecraft version metadata as the canonical source of library downloads, artifact paths, SHA-1/SHA-256 if available, sizes, natives classifiers, asset index, assets, main class and arguments.
2. Resolve the official version manifest -> exact version JSON -> client JAR and library/asset downloads using documented official URLs. Do not parse an arbitrary URL/JSON supplied by the frontend.
3. Download assets objects defined by the asset index, validating expected content/size/hash. Download all required libraries and native classifiers. Choose classifiers by actual target OS and architecture. Either support each OS/architecture in the bundle declaration or reduce product target claims to only platforms genuinely built/tested.
4. Verify cached artifacts before reuse. A file's existence is not proof of integrity. Use temp-file -> bounded streaming -> hash/size/type verification -> atomic rename. Clean stale partials. Never overwrite the last known-good file before new-file validation passes.
5. Check HTTP status, content length, redirect policy and actual byte count; enforce timeouts, retries with backoff and maximum sizes. Return structured errors for rate limits, server errors, checksum mismatches, interrupted downloads and disk-full conditions.
6. Harden ZIP/native/resource-pack extraction against path traversal, absolute paths, Windows drive/UNC paths, symlink/junction escape, unexpected file type and expansion bombs. Validate final destination remains inside canonical controlled root.
7. Build classpath and arguments only from resolved metadata; remove heuristics like `main_class.contains("net.minecraft")`.

### Mod catalog/downloads

1. Change the command API from arbitrary `download_url` + `filename` to a trusted `mod_id` resolved by a repository-controlled and versioned catalog. No frontend-provided arbitrary URL reaches `reqwest`.
2. Catalog records must include ID, display name, exact version, compatible Minecraft version, required loader, supported OS if relevant, trusted HTTPS source host, exact URL, expected byte size, SHA-256, author/source page, license, and status. Validate catalog schema and signature; never label unverified content “trusted”.
3. Strict allowlist for HTTPS hosts and redirects. Reject `file:`, loopback, link-local, private IP and other unsafe targets; use safe DNS/redirect rules to mitigate local-service SSRF.
4. Enforce compressed size and archive expanded size/file count limits, JAR structure, expected metadata, SHA-256, version/loader compatibility, and safe filenames. Atomic install, inventory/provenance and uninstall/rollback. Reject unsigned/unknown artifacts unless an explicit and conspicuous advanced override is intentionally designed; default should be fail closed.
5. Confirm the actual target loader supports each mod; do not claim Forge mods work in a vanilla-only runtime. Remove placeholder catalog entries that lack a valid, stable, directly downloadable and checksummed artifact.

### Required adversarial tests

Test non-HTTPS URL, hostname/redirect switch, loopback/private network, path traversal names, Unicode/confusable names, empty response, HTTP 200 HTML, enormous `Content-Length`, streamed oversize, mismatch digest, malformed JAR/ZIP, ZIP Slip, symlink/junction escapes, cancelled write, disk full, corrupt cached artifact, and a catalog with invalid signature. Verify no partially installed or executable artifact remains.

## P0 — CSP, Tauri COMMANDS, PATHS AND JVM ARGUMENTS

1. Replace null CSP with a restrictive CSP tailored to the built frontend. Do not allow remote scripts. Keep `connect-src`, `img-src`, fonts and asset sources only as needed.
2. Audit Tauri capabilities/permissions and shell plugin. Remove unused permissions and grant the minimum commands needed per window. Do not expose broad shell execution to generic frontend content.
3. Treat all frontend input as untrusted. Strongly type and validate every Tauri command; limit string sizes and numeric ranges; reject unexpected enum values.
4. Replace lexical-only path checks with canonical/handle-based containment and explicit protections for symlinks/junctions and Windows path edge cases. Avoid TOCTOU by secure creation/rename patterns.
5. Keep logs secret-safe by design. Never log full credentials/token URLs. Add tests for all known secret shapes; cap each line and total in-memory logs.
6. Parse user JVM args correctly; no whitespace-only `split`. Do not allow extra flags to override classpath, game/natives directory, heap caps, agents or other launcher-owned arguments. Prefer a small supported tuning settings UI instead of arbitrary flags; if an advanced field remains, tokenize it safely and reject dangerous/conflicting flags.
7. Implement launch reservation/locking **before** network awaits so double-click/concurrent requests cannot spawn duplicates. Track child exit, exit code and process tree. Try graceful stop first, then bounded force-kill fallback; only clear state after verifying exit.

## P1 — OFFLINE LOCAL PROFILES ONLY

1. Remove Microsoft login UI, commands and incomplete `microsoft_auth.rs` paths from the shipped command registry. If an old migration must remain, ensure it cannot be invoked from the UI and never fabricates auth results.
2. Offline account DTO should be `kind: "offline_local"`, validated username, the UUID/session behavior expected by the selected 1.8.9 launch path, and no access/refresh tokens. Derive username constraints from the actual game/loader contract and test edge cases; do not assume or fabricate a premium identity.
3. Remove placeholder values like `offline_token` and `local_offline_token`; pass only the documented username/UUID and a non-authenticated local session representation supported by the loader. Never call it premium or authenticated.
4. Tell users plainly, in UI and docs: an offline profile works in single-player and on servers explicitly configured for offline mode; it cannot authenticate to online-mode servers such as Hypixel. Do not evade this with forged tokens.
5. Store profile metadata atomically with restrictive permissions where supported. It currently should contain no secret material. If account schema ever acquires secrets in a future approved product change, use OS credential storage rather than plaintext JSON.

## P1 — SETTINGS, MODULE IDS, PROFILE PERSISTENCE AND UI REALITY

1. Create one schema/type definition source or generate bindings from one schema; use stable module IDs, not display labels. Include schema version, migrations, validation and defaults.
2. Reconcile `shared/schemas/*.json` with actual Rust/Java persisted shapes. For example, compare `profile.schema.json` with `save_custom_profile`, and keep launcher settings, game config, and profiles as explicit distinct schemas. Add schema validation tests at serialization boundaries; a schema file that is never loaded does not enforce anything.
3. Fix existing key mismatches (FPS/CPS/FastMath/Bed Status/Entity Culling and related IDs). Add tests proving load -> toggle -> save -> restart -> module state matches.
4. Make profile creation/delete/update transactional: validate inputs, persist to native storage, then update UI after success. Surface failure; don't show an unsaved row as successful. Validate duplicate names/IDs and protect built-in profiles from accidental deletion.
5. Make selection actually apply at game startup: modules, HUD element positions, performance settings, resource packs, resolution and relevant launch settings. If a preference is unsupported, remove it from UI or show disabled with explanation.
6. Implement or remove currently ineffective flags such as `closeLauncherOnGameStart`, update preferences and hardware-acceleration preferences. Honor them only after successful game startup, not at initial process spawn.
7. Replace hardcoded system RAM with real OS metrics or `unknown`. Distinguish installed, downloaded, verified, starting, running, exited, failed; distinguish update unavailable from up to date; distinguish actual telemetry from preview values.
8. Put all mock bridge behavior behind explicit Preview Mode UI and build-time gating; production native mode must not fall back to fake account, fake PID, fake installed JAR, fake system stats or fake running status.
9. Polish UI using existing React/Tailwind instead of rewriting it: consistent design tokens, spacing/type/icon scales, responsive supported window sizes, clear status colors, real loading/empty/error/retry states, keyboard/focus accessibility, modal focus trap/escape, reduced motion and clear diagnostic export. Do not use competitor logos/art.

## P1 — PROFILES / UPDATER / LIVE LOGGING

1. Fix the updater endpoint to this repository and a canonical `latest`/channel manifest. Use a strict schema, pinned artifact URL, platform/architecture, version, byte size, SHA-256 and cryptographic signature. Verify against a public key embedded in the application. Keep signing/private keys only in a protected release environment.
2. Use semantic version parsing (including pre-releases) rather than the current simplistic dot split. Treat network errors as `Unavailable`, not `Up to date`.
3. Build downloader/integrity tests and safe update swap/rollback. Never update executable code from an untrusted PR artifact or unsigned manifest.
4. Connect Rust logger/child stdout+stderr to a bounded structured log stream that actually reaches the diagnostics page. Current state log vector must not pretend to contain everything if it only records command operations. Redact secrets before emit; include timestamp/severity/component/phase/code. Do not log arbitrary tokens, entire private paths if privacy mode applies, or full environment variables.
5. Show final launch args with sensitive values redacted; provide “copy diagnostics” and “open logs folder”. Report child exit status and crash reason accurately.
6. Correct `check_updates` so it uses the current app version from build metadata rather than hardcoded `1.0.0`.

## P2 — REAL MODULES AND PERFORMANCE

Implement feature groups incrementally, testing each against real Minecraft events. Every item must have an implementation status and must not display simulated live values as real.

**Core first:** FPS/frame-time and 1% lows; CPS; keystrokes; coordinates/direction; armor/potion effects; ping when a server connection exists; custom crosshair; combo counter; zoom; freelook; keybinds; Right Shift ClickGUI; HUD dragging/scaling and persisted layouts.

**Next:** legitimate 1.7-style animation compatibility where implemented; low fire; cosmetic block/particle/animation options; screenshot management; resource pack install/preview/activation; real supported mod catalog. Bed status/resource timers must be backed by actual world/packet/known server state and show “unknown” without enough evidence. Do not ship fixed mock bed counts/timers/potion values/reach/FPS/ping/populations as live.

**Performance rules:**

- Profile first and record baseline metrics before optimizing. Do not promise fixed FPS gains or “better than Lunar”.
- Remove forced `System.gc()` from the normal hot path/presets. It is not “memory defragmentation” and may stall a frame.
- Replace FPS history list cloning/sorting on every tick with primitive bounded ring buffers and periodic percentile calculation. Sample actual frame durations from the render loop.
- Benchmark FastMath against `Math`/JIT using representative workloads; handle NaN, infinities, negative values and overflow. Delete unproven optimizations rather than shipping them as marketing claims.
- No file/network I/O, blocking waits, large allocations, per-tick sorting, reflection scans or JSON parsing in render/tick hooks.
- Keep game config immutable or snapshot-based at hot-path reads; use bounded background workers for downloads and diagnostics.
- Measure launcher CPU/RAM separately from Minecraft. Exit/minimize the launcher only when the game's startup is truly confirmed and preference permits it. Don't claim closing the launcher directly increases the game's FPS; it only releases launcher overhead.
- Write a repeatable manual GPU performance protocol including hardware/driver/OS/Java, game options, world/replay scene, render distance, resource pack, JVM flags, baseline/post frame-time percentiles, CPU, memory, GC pauses and repeat count. CI VM FPS is not consumer hardware data.

## P1 — FULL CI AND ARTIFACT RELEASES ON GITHUB ONLY

User requirement means every pushed commit and pull request should be validated and produce a commit-specific CI artifact when buildable. It does **not** mean that an untrusted fork PR should be allowed to publish an official public stable release or use release secrets.

### Workflow requirements

1. Configure core CI with `push` on all branches and `pull_request` with no restricted target-branch list, plus `workflow_dispatch`. Ensure path filters do not accidentally skip required check workflows; if paths are used, use a dependable top-level workflow/change detection design and preserve a required always-present check.
2. Add/ensure separate build jobs for frontend, Rust/Tauri native, real 1.8.9 mod, integration/packaging and security checks. Test all appropriate OS/architectures actually supported; don't claim unsupported target builds.
3. On PRs, use `pull_request` with read-only permissions, no signing/release secrets, and no privileged execution of untrusted PR code. Never combine `pull_request_target` with checking out and executing PR content.
4. Use `npm ci` and cache `launcher/package-lock.json`. Commit a Rust `Cargo.lock` for the app, lock Gradle plugin/dependency versions, pin/download legacy toolchain distributions with checksums where practical, and document repository-host availability. Use dependency locking/verification where supported.
5. Pin all third-party GitHub Actions to full reviewed commit SHAs (include comments naming the version), set job/workflow `permissions` explicitly (`contents: read` by default), apply concurrency/cancel superseded PR builds, do not give PR jobs `contents: write`, and isolate release signing credentials in protected environments.
6. Do not use `npx tauri build || cargo build --release` or similar fallbacks that hide a failed actual product build. Split debugging builds into separate clearly named jobs if useful, but product package failure must be a failed status.
7. Upload real outputs with strict required paths and `if-no-files-found: error` for expected release bundles. Upload test logs/reports in separate `if: always()` diagnostics steps.
8. On every push branch and PR, upload commit-addressable Actions artifacts (label with commit SHA, branch/PR number, OS/arch, toolchain and channel). On trusted `main` pushes you may create a `nightly`/snapshot prerelease with SHA in version. Official stable releases only from protected version tags (`vX.Y.Z`) or an explicit manual approval. Do not publish stable release from every commit or PR.
9. Update `scripts/package_release.py` to stage only actual supported launcher installers, never the Java Swing preview JAR, and validate the exact supported MSI/NSIS input set. Empty its staging directory safely, fail on missing/ambiguous/wrong-format artifacts, reject stale output, write complete SHA-256 manifests, and verify output paths remain inside expected `dist` directory.
10. Make `dependency-review.yml` actually fail on configured blocking severities instead of `continue-on-error: true`. Add applicable `cargo audit`, `cargo deny`, npm advisory scan, Java/Gradle dependency scan, CodeQL supported languages, secrets detection and SBOM output. Triage false positives with scoped documented suppressions and expiry rather than a blanket ignore.
11. Add cache keys tied to lockfiles and target, avoid untrusted pull-request cache poisoning, and never restore a writable privileged cache from a fork job.
12. Add release validation that downloads the published artifacts and verifies manifest/signature/hash from a clean job. Generate changelog/release notes from actual shipped version/commit.
13. Add a clean-install workflow test that starts without any local `client/build/libs` or `.samrat` JAR, downloads only the canonical published artifact, and fails clearly when no valid published artifact exists. Validate generated desktop bundle icons in the real packaging jobs; do not accept a PNG renamed to `.icns`.

### Workflow acceptance tests

- A push to arbitrary branch `audit/test-pipeline` triggers validation.
- A PR targeting a non-main branch triggers the same tests without privileged secrets.
- A deliberately broken TypeScript build, Rust build, Java/mod build, missing expected artifact, invalid digest or packaging failure yields a red job.
- A successful branch build exposes a versioned downloadable artifact for its exact SHA.
- A clean install succeeds from the published artifact without relying on workspace-local build output; absent release assets produce an explicit unavailable/error result.
- Every declared desktop bundle target packages with valid native icon formats, or the supported target matrix is narrowed to platforms actually built.
- A fork PR cannot create a GitHub Release, access signing keys or write repository contents.
- A protected `vX.Y.Z` tag creates the intended stable release only after all required checks pass; installable assets, signatures and checksums verify after download.

## REQUIRED TEST PLAN

Create and run tests, not just type signatures. Minimum coverage:

**Rust/native unit & integration tests**
- offline name/UUID validation and migration
- launch configuration validation and argument order/overrides
- concurrent-launch reservation and cleanup on all errors
- child exit/nonzero exit/fast crash/log streaming/terminate tree
- version manifest parsing, assets/library resolution
- checksum mismatch, corrupted existing files, atomic install/cancel/retry
- zip-slip/traversal/symlink/oversize archive guards
- mod catalog signature/allowlist/hash/version/format
- update manifest signature/version/rollback/network failure
- path guard across Windows drive/UNC and case-insensitive paths
- log redaction/size caps
- persisted configuration/profile/module roundtrip and schema migration
- JSON schema validation against each actual persisted Rust/Java shape; documentation/security claim consistency checks

**Java/MC mod tests**
- actual loader bootstrap for 1.8.9 and lifecycle events
- module enable/disable/save/reload
- keybind/right-shift behavior and focus edge cases
- HUD uses live player/world/render/network values and correctly becomes unavailable
- ring-buffer frame-time calculations, percentiles and sampling overhead
- real game smoke test plus at least one known-good visual/module interaction

**Frontend tests**
- launch state machine and optimistic state prevention
- progress/error/retry/unsupported paths
- bridge schema types and visible Preview Mode isolation
- profiles only update UI after native save succeeds
- module stable IDs and persisted state
- settings loaded/saved/applied correctly
- accessibility keyboard navigation and modal behavior for critical screens

**CI/release tests**
- all workflows parse and trigger as intended
- no missing artifacts can return green status
- deterministic package output from clean tree
- signature/hash manifest validation after download

Add meaningful tests for every regression you fix. Keep unit tests fast and isolate network tests using an HTTP test server/fakes; integration tests should not require production endpoints or real credentials.

## DEFINITION OF DONE / REPORTING REQUIREMENTS

Do not stop after the audit or a UI restyle. For each phase:

1. Implement focused changes on a working branch; use small cohesive commits where tools permit.
2. Do not build or test on the user's PC. Run the authoritative build and regression suite in GitHub Actions and record the exact run URL and observed status. Trigger or publish only when the current credentials and user authorization permit it; otherwise leave the implementation ready and clearly report the exact CI action still needed.
3. Record exact commit SHA(s), workflow run links, build job statuses, test counts, released artifact names, SHA-256 checksums, and known blocked tests.
4. Review generated diffs for accidental generated files, binary/world/user data, lockfile drift, insecure permissions, secrets or misleading README marketing. Do not claim external CI passed if you did not observe a successful run.
5. Keep README/setup docs accurate: mark preview features, list actual supported OS/arch/Java/loader matrix, explain offline-only limitations, and use a “feature support” table.
6. Maintain `docs/REMEDIATION_STATUS.md` using a table: ID, priority, evidence/file, change/commit, validation, status, residual risk. For vulnerabilities, include threat model and test, not only a scanner result.
7. If a feature cannot be completed safely in the current phase, disable/remove its misleading UI and document what blocks it instead of leaving an inert/fake feature marked done.
8. Provide a final concise report with: resolved P0/P1s; architecture/loader choice and justification; tests that really passed; CI/run links; downloadable artifacts; items that remain unverified; and exact manual GPU smoke steps. Never say “fully secure” or “best FPS” as an unqualified guarantee.

## SUGGESTED ORDER (DO NOT IMPLEMENT EVERYTHING IN ONE BLIND REWRITE)

1. Recon + failing regression tests + `docs/REMEDIATION_STATUS.md`.
2. CI/release baseline and clean artifact determinism.
3. Actual 1.8.9 loader/mod POC plus smoke-test evidence; remove fake launch fallback.
4. Installer metadata/assets/hash/atomic install and Java compatibility.
5. mod downloader/path/CSP/capability/JVM-argument hardening.
6. process lifecycle/logs/update trust.
7. offline profiles, config schema, module IDs, profiles/settings persistence.
8. high-value real HUD/QoL modules.
9. resource pack/mod management and GUI/UI polishing.
10. measured performance optimizations, docs and signed stable release.

Start by inspecting the repository and completing phase 0/phase 1 without breaking existing files. Then proceed through the sequence, verifying the actual Minecraft 1.8.9 integration early. Do not return only a plan: make code changes wherever repository access allows, and report evidence honestly.
