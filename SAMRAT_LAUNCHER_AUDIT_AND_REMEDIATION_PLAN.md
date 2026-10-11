# SAMRAT Launcher / Client — Repository Audit & Remediation Plan

> **Account-storage update (2026-10-11):** The current working tree returns an empty account store on first run, persists account metadata without access/refresh tokens, and clears credentials when loading older account JSON. Regression tests have been added but have not run in Actions. Microsoft authentication remains incomplete, no OS credential vault is wired, and this does not enable online game launch. The installer still contains the hardcoded, unchecked partial-download path documented in `docs/REMEDIATION_STATUS.md`.

> **Path-security update (2026-10-11):** `verify_update_file` now checks canonical filesystem containment to reject existing symlink escapes, with regression tests added. These tests have not run in Actions; canonicalize-then-open remains subject to a race, and Windows junction/reparse-point handling has not been validated.

> **Process-race update (2026-10-11):** `LauncherEngine` now reserves the launch slot before awaiting runtime installation and releases it with RAII on failure. A regression test covers reservation exclusion/release; it has not run in Actions, and the UI launch command remains disabled.

> **Forge smoke evidence (2026-10-11):** On commit `85b8d0a`, Forge build, HTTPS asset checks, and asset staging passed; Minecraft 1.8.9 reached LWJGL startup but crashed before the main menu because Xvfb exposed no usable display modes/OpenGL context. On `2ba662b`, Xvfb exposed a 1280x800 RandR mode, but the smoke stopped because `glxinfo` was not installed. The workflow now installs `mesa-utils`; the next run must prove the renderer and main-menu marker. See `docs/REMEDIATION_STATUS.md` for run links.

> **Latest CI update (2026-10-11):** The account, canonical-path, and launch-reservation Rust regression tests passed in run [38138523370](https://github.com/GamingOP69/Launcher/actions/runs/38138523370). Forge run [38138523392](https://github.com/GamingOP69/Launcher/actions/runs/38138523392) passed the Minecraft 1.8.9 development main-menu smoke under software OpenGL. Tauri package launch remains unverified; see the ledger for older failed runs and outstanding checks.

**Repository:** [`GamingOP69/Launcher`](https://github.com/GamingOP69/Launcher)  
**Source snapshot audited:** `Launcher-main.zip`, commit `79af13ecb8549c72ca1c90835e99096d56329f94`  
**Audit date:** 11 October 2026  
**Purpose:** A source-level diagnosis and implementation roadmap for a reliable Minecraft Java Edition 1.8.9 PvP client with a native desktop launcher.

> **Scope and confidence.** This report is based on source inspection of the checked-out repository at commit `79af13ecb8549c72ca1c90835e99096d56329f94`, static searches through application code, configuration, scripts, and workflows, and review of primary upstream documentation. It is a source-level audit, not a claim that every possible bug has been found. No build or test command was run for this audit; the requested delivery is analysis and implementation guidance, and builds should run in GitHub Actions. Actual Windows packaging, clean-install behavior, and in-game rendering remain unverified until CI and a real game smoke test provide evidence.

> **Remediation update (2026-10-11):** Subsequent source changes fail closed for client install/launch and remove the Swing preview fallback. The purported `SamratTweaker`/`SamratTransformer` were confirmed to be stubs: they did not implement LaunchWrapper or register a transformer, and their tests only exercised plain Java methods. Those classes, those behavior-only tests, and the JAR's misleading `TweakClass`/`TweakOrder` manifest attributes have been removed. The Java artifact is explicitly titled “Samrat Swing Preview 1.8.9”. A separate minimal Forge 1.8.9 `@Mod` with an in-game HUD marker and CI main-menu smoke hook has now been added under `forge-client/`; its Actions validation is pending and the Tauri launcher does not install or launch it. These changes reduce false integration claims and establish an integration path, but do **not** resolve the P0 launcher-driven real-game startup finding. Current validation evidence and residual risks are in `docs/REMEDIATION_STATUS.md`.

## 1. Executive verdict

The primary failure is architectural, not a handful of small bugs. The repository currently contains a polished-looking *simulation* of a Minecraft client, but it does not contain a functioning integration layer connecting the module/HUD code to the real Minecraft 1.8.9 runtime. The native launcher tries to start vanilla Minecraft's `net.minecraft.client.main.Main`, while the built Java JAR is packaged as a standalone Swing application. The manifest's `TweakClass` attribute is not a substitute for LaunchWrapper's actual startup contract, and the launch path does not start LaunchWrapper or pass a tweak class. The existing `SamratTweaker` is a plain Java class—not an implementation of the actual `ITweaker` interface—and the transformer is not registered with a real bytecode transformer. As a result, many client features are either simulated, disconnected from game state, or unable to execute in-game.

The second major issue is that the installer and release pipeline are not dependable enough to deliver a working runtime. They omit asset-object downloads, skip some failed library downloads, do not validate all downloaded artifacts, have platform-specific native extraction despite a multi-platform bundle claim, and can package stale/empty outputs. Several launcher UI states are optimistic: “launch succeeded” currently means that a process spawn returned, not that Minecraft reached its main menu.

The third major issue is trust/safety at the desktop boundary: the embedded web UI can supply arbitrary mod-download URLs, and the Rust command downloads directly into a directory from which JARs may later execute. CSP is disabled, shell permissions may be broader than required, arbitrary JVM arguments can override launcher-controlled options, and updates are not tied to a correctly configured trusted manifest. These issues should be fixed before enabling auto-updates or a mod catalog for real users.

### Severity overview

| Priority | Finding | Why it matters |
|---|---|---|
| **P0 — release blocker** | No real 1.8.9 integration pipeline; simulated Swing app is treated as a client fallback | The expected Minecraft client cannot run its HUD/modules as advertised. |
| **P0 — fresh-install blocker** | GitHub Releases do contain launcher installers and `samrat-client-1.8.9.jar` assets (latest observed `v1.0.18`, 2026-08-16), but the published client artifact is the standalone Swing application and is not a Minecraft/Forge mod | A downloaded artifact exists, but it does not provide the advertised in-game client integration; asset discovery also does not pin a digest. |
| **P0 — security blocker** | Frontend-controlled download URL writes bytes into the mods directory without trusted digest/size/format validation | A crafted URL can cause malicious or invalid JAR content to be persisted for later execution. It also creates a local-service request/SSRF-style risk in a desktop webview context. |
| **P0 — release blocker** | Minecraft installer does not install and verify the complete metadata-defined runtime (libraries, asset objects, natives, launch arguments) | Missing libraries/assets and invalid cached JARs can prevent launch or cause intermittent failure. |
| **P1 — high** | Updater URL targets another repository and errors can look like “up to date” | Users can miss updates, download the wrong artifact, or receive misleading status. |
| **P1 — high** | Tauri CSP is `null`; permissions/dependency supply chain need least-privilege hardening | A renderer compromise would have a larger impact than necessary. |
| **P1 — high** | CI does not run build/validation for every branch/PR, and launcher build hides Tauri bundle failures | Broken commits may appear successful; releases may omit the actual launcher bundle. |
| **P1 — high** | Offline account/token model is inconsistent; account IDs/name validation are wrong/incomplete | Misleading identity semantics, persistence inconsistencies, and broken server expectations. |
| **P1 — high** | Profiles/modules/settings have mismatched IDs or are state-only | Controls can appear to work but not affect the game or survive restart. |
| **P2 — medium** | Fake FPS, ping, server population, Bedwars data, system-memory stats, mocked preview data | Misleading diagnostic/performance UI and difficult debugging. |
| **P2 — medium** | Hot-path allocation/sorting and forced `System.gc()` are called “optimizations” | Can increase jitter/stutter and fail to improve FPS. |

## 2. Confirmed architectural findings

### 2.1 Java artifact is not a Minecraft mod/client runtime

Relevant areas:

- `client/build.gradle`
- `client/src/main/java/com/samrat/SamratClient.java`
- `client/src/main/java/com/samrat/gui/StandaloneClientWindow.java`
- `client/src/main/java/com/samrat/core/tweaker/SamratTweaker.java`
- `client/src/main/java/com/samrat/core/tweaker/SamratTransformer.java`
- `core/src/main/java/...` and duplicate `client/src/main/java/.../core/event/...`
- `launcher/src-tauri/src/launch/launcher_engine.rs`

Evidence from the source:

1. `client/build.gradle` configures `application.mainClass` as `com.samrat.SamratClient`, shades runtime dependencies into a standalone executable JAR, and adds manifest attributes such as `TweakClass`. A manifest attribute alone does not make the JAR a working game mod.
2. `SamratClient` creates a Swing `JFrame` via `StandaloneClientWindow`. That window paints mock Minecraft-like screens; it is not a Minecraft window/render loop.
3. A static source scan found **no imports** of `net.minecraft.*`, `net.minecraftforge.*`, `org.lwjgl.*`, `org.objectweb.asm.*`, or `net.minecraft.launchwrapper.*` in the current Java sources; the Gradle files also do not declare those game/loader dependencies.
4. `SamratTweaker` does not implement LaunchWrapper's `ITweaker`, takes an `Object` in its inject method rather than the actual class-loader contract, and does not register a transformer with a LaunchWrapper classloader.
5. `launcher_engine.rs` launches vanilla's `net.minecraft.client.main.Main` and does not launch `net.minecraft.launchwrapper.Launch` with a `--tweakClass` argument. If installation fails, it falls back to running `com.samrat.SamratClient`, which can show the simulated UI and be mistaken for a successful game launch.
6. Event classes and modules exist, but no actual Minecraft hooks publish game tick/render/input/network events to them. Having a `PacketEvent`, `Render2DEvent`, or module class does not make those events fire.

**Required decision:** do not keep patching the Swing simulation and assume that it will become Minecraft. Treat the mock UI as a design preview only and remove it from production launch paths. Pick and prove one genuine 1.8.9 integration approach before implementing features. Forge is a reasonable proof-of-concept choice, not a conclusion that the project already uses Forge or that Forge is the only viable architecture. Verify the legacy toolchain in clean CI before committing to it:

- **Recommended first proof of concept:** an actual Minecraft Forge 1.8.9 mod with the verified Forge 1.8.9 toolchain, using Forge's supported lifecycle/render/input hooks. This is the most straightforward path for a client that needs compatible mods and HUD features. Forge publishes a dedicated 1.8.9 download/MDK page: <https://files.minecraftforge.net/net/minecraftforge/forge/index_1.8.9.html>.
- **Alternative only if justified:** a vanilla LaunchWrapper/ASM or Mixin-based integration. If this route is chosen, include the real compatible LaunchWrapper and bytecode library dependencies, implement the exact interface/signature for the chosen version, register actual transformations/hooks, and prove a clean vanilla 1.8.9 launch. A manifest attribute alone does not load the tweaker.

Minecraft 1.8.9 is a legacy target. Keep the legacy runtime build isolated from modern launcher tooling where necessary. Do not blindly combine an old ForgeGradle generation with the current Gradle 8.5 wrapper; verify a compatible Java/Gradle/ForgeGradle matrix in CI. The launcher can be modern while the game-mod module uses the exact toolchain required by the historical game version.

### 2.2 Simulated values are presented as live game facts

`client/src/main/java/com/samrat/gui/StandaloneClientWindow.java` initializes fixed/example values for FPS (e.g. `144`), ping, server populations, coordinates, and a Bedwars scoreboard. Some module classes explicitly describe their values as mock data. These values are acceptable only in an unmistakably marked **Preview/Demo mode**. Production mode must display real game telemetry or state `Not available`/`Not connected`—never present fake values as real.

### 2.3 A “spawned process” is not a “game launched” event

`App.tsx` marks `isRunning` and `clientInstalled` true immediately after the native launch command returns. It does not wait for a real main menu signal or detect a quick crash. The process poll only tells whether a PID exists. The fallback Swing window compounds this error.

Implement a launcher lifecycle state machine, such as:

`Idle -> CheckingRuntime -> Downloading -> Verifying -> Preparing -> Starting -> GameRunning -> Exited/Failed`

Emit progress and status events with stable event payloads. Capture child stdout/stderr, report exit codes, detect immediate exits, sanitize secrets, cap log line sizes and buffer size, and show errors with a direct “open log” action. “Game Running” should mean the child process has been running beyond a grace period and/or a known startup signal has been detected; state the limitation accurately if a reliable main-menu handshake is not possible.

## 3. Installer and launch pipeline

Relevant areas: `launcher/src-tauri/src/launch/minecraft_installer.rs`, `launcher/src-tauri/src/launch/launcher_engine.rs`, `launcher/src-tauri/src/launch/args_builder.rs`, and `launcher/src-tauri/src/java/detector.rs`.

### Confirmed defects and fixes

1. **Hardcoded/incomplete library list.** The installer manually enumerates some library artifacts and tolerates download failures. A failed dependency can be silently skipped. Use official Minecraft version metadata as the canonical source of `downloads`, `libraries`, `natives`, `assetIndex`, `mainClass`, and game/JVM argument rules instead of maintaining a partial list.
2. **A release payload exists, but it is not a usable Minecraft client.** The live repository API returned published release `v1.0.18` with a `samrat-client-1.8.9.jar` asset (GitHub reports SHA-256 `73e9f3e869685a8582f4d5fbad902eca02bd79ca947a887b72ccf951bad79429`). This corrects the earlier audit's claim that Releases was empty. Source inspection still shows `client/build.gradle` packages `com.samrat.SamratClient` as `Main-Class`, and that class opens Swing; the asset is not evidence of a mod. The installer accepts release assets by name without checking a trusted digest, so clean-install integrity remains unresolved.
3. **Missing asset-object stage.** Downloading an asset index file is not the same as downloading all asset objects. Parse the version's asset index and verify required objects by the index's hash and size, using the official Mojang asset layout.
4. **No strong local cache verification.** Do not trust a file merely because it exists. Verify expected size and hash before reuse; quarantine or remove bad partial downloads and fetch again.
5. **No atomic/complete write guarantee.** Download to a unique temporary file, enforce status/content/size, stream to disk, hash it, then atomically rename. Do not leave a partial file at the final path.
6. **Weak HTTP handling.** Check HTTP status before reading bytes, set connection and total timeouts, use bounded streaming, retry transient failures with backoff, and return precise errors. A server may return an HTML error page with status 200; validate expected archive type/metadata and checksum too.
7. **Native extraction is Windows-specific.** Two Windows-native JARs are extracted unconditionally even though Tauri targets are configured as `all`. Either support each declared OS/architecture with correct metadata/native selection or make the product Windows-only now and enforce that claim consistently in CI/release/UI. Never claim cross-platform support that has not been built and tested.
8. **The generated macOS icon is not an ICNS file.** `scripts/generate_icons.py` writes the 256×256 PNG bytes directly to `launcher/src-tauri/icons/icon.icns`, while `tauri.conf.json` declares that file as a bundle icon and requests all targets. This is a confirmed format mismatch; whether a specific Tauri packaging tool rejects or tolerates it needs a macOS CI build. Generate a valid ICNS container using a proper tool and validate every declared icon format in CI.
9. **Archive extraction needs path validation.** Validate every ZIP entry's normalized destination against the intended extraction root; reject absolute paths, parent traversal, symlinks when not required, unexpected native extensions, and oversized expansion. Do not rely on a currently hardcoded URL as a permanent safety boundary.
10. **Use one authoritative version metadata object.** Derive classpath, native paths, assets, main class, and JVM/game args from the same resolved version metadata to prevent mismatch between what was installed and what gets launched.
11. **Make launch idempotent.** `launch_async` checks the running PID before asynchronous downloads, leaving a race where two callers can pass the check and spawn two processes. Reserve launch state under a lock before awaits; release reservation on every failure path. Store the child process lifecycle/exit code, not just a PID.
12. **Terminate process trees robustly.** Current logic force-kills (`taskkill /PID /F` on Windows without `/T`, `kill -9` elsewhere) and can clear the PID while the process is still running if the kill command fails. Prefer graceful termination then timeout and force-kill the process tree; only clear state after confirming termination.
13. **Java detection is platform-inaccurate.** The implementation uses Windows `where java` unconditionally for PATH discovery, which will fail on Unix-like systems. The “recommended” version predicate and user-facing accepted versions disagree. Detect OS/architecture correctly, inspect actual `java -version` output, validate architecture/version, prefer an explicitly selected valid runtime, and clearly state which JDK versions were tested with 1.8.9.
14. **Build game arguments structurally.** `main_class.contains("net.minecraft")` is a brittle switch. Use the selected loader profile type. Use robust argument tokenization; whitespace splitting breaks quoted JVM arguments. Do not allow custom arguments to override controlled classpath, native path, heap size, agents, or security-sensitive flags.

## 4. Security findings (fix before release)

### 4.1 Arbitrary mod URL -> executable directory — **P0**

`download_curated_mod` accepts both `download_url` and `filename` from the frontend, requests the caller-supplied URL, and writes its bytes into `~/.samrat/game/mods/`. The filename gets some sanitation but the URL does not use a trusted catalog lookup. There is no size cap, checksum, content validation, or atomic write. Risks include fetching from local/private services, returning arbitrary content, downloading malicious JARs, and saving content which a loader may execute.

**Fix:** change the native API to accept only an immutable `mod_id` (and optionally a catalog version), never an arbitrary URL. Resolve it through a repository-controlled/cryptographically verified catalog. Require HTTPS and exact allowlisted host(s); reject redirects to other hosts unless explicitly validated; set maximum compressed and expanded sizes; require a trusted SHA-256 digest and declared byte size; inspect JAR/ZIP structure and metadata; enforce Minecraft version, loader, architecture and mod version; download to a staging directory, atomically install, and maintain an inventory with provenance. Never automatically install a URL returned from untrusted page content. Test URL schemes, redirects, DNS/IP edge cases, oversize content, malformed archives, ZIP Slip, hash mismatch, partial writes and filename traversal.

### 4.2 CSP disabled and capabilities should be minimized — **P1**

`launcher/src-tauri/tauri.conf.json` sets `app.security.csp` (security CSP) to `null`. `launcher/src-tauri/capabilities/default.json` grants `core:default` and `shell:default`. Tauri's own documentation explains CSP and its capability/permission model: <https://v2.tauri.app/security/csp/> and <https://tauri.app/security/capabilities/>.

**Fix:** set a restrictive app-specific CSP (self/local asset sources only; no arbitrary remote scripts), keep any remote skin or catalog images constrained, audit the shell plugin and remove it if unused, and grant only the exact commands/window/process permissions required. A settings or web-content compromise should not automatically gain broad shell access.

### 4.3 Download integrity and updater trust — **P1**

The client JAR download searches every release and accepts an asset name that matches a pattern, then writes bytes to the final path without verifying a trusted expected digest or JAR structure. The updater points at `https://raw.githubusercontent.com/samrat-client/launcher/main/dist/update-manifest-{}.json`, which does not match this project (`GamingOP69/Launcher`). Network errors can be interpreted like no update. The SHA-256 verifier only provides security if the expected value comes from a trusted, authenticated manifest rather than the same untrusted caller that supplies the file.

**Fix:** define one canonical release endpoint and versioned manifest under the actual repository/owner; define a schema including product, platform, architecture, version, minimum supported version, exact asset URL, byte size, SHA-256 and signature. Sign the manifest/artifacts using a release key whose public key is embedded in the updater or otherwise validated. Verify signature and digest before use, stage to temporary files, atomically swap only after verification, and preserve rollback. Show `Update check unavailable` separately from `Up to date`; never silently treat connectivity failure as a successful freshness check. Never run self-update from a PR build.

### 4.4 Path safety and archives — **P1**

At the original audit snapshot, `verify_update_file` used only lexical path checks. The current working tree adds canonical existing-target containment to reject symlink escapes, but does not eliminate time-of-check/time-of-use races or validate Windows reparse-point behavior. Archive extractors and other user-controlled paths still require traversal rejection and safe resolution under an app-controlled root. Be careful about drive prefixes, UNC paths, alternate separators, case behavior, junctions, and races.

### 4.5 JVM arguments are executable inputs — **P1**

Arbitrary extra JVM options can change classpath/native paths, add Java agents (`-javaagent`), adjust runtime heap after the launcher-controlled flags, or load external libraries. Existing argument parsing is simplistic and permits potentially overriding settings. If custom flags remain, parse into tokens with a well-defined grammar and allowlist safe, documented tuning flags; explicitly reject or warn on classpath, library path, agents, module opens with unexpected targets, executable commands, duplicate/conflicting `-Xmx`, or launcher-owned parameters. Display the final effective launch command with token redaction and safe diagnostic output.

### 4.6 Credentials and offline-only identity model — **P1**

`App.tsx` passes placeholder strings such as `offline_token` when the active account has no access token. `create_offline_account` creates a misleading `local_offline_token`, marks `is_dev_mode: false`, and the helper name for ID creation does not match its actual SHA-256/truncation implementation. It does not enforce the Minecraft username syntax/length. `microsoft_auth.rs` contains incomplete OAuth logic; it tries to use Microsoft access tokens directly for a Minecraft profile request and may fabricate a player profile if no profile is returned. This is not a valid complete Microsoft/Xbox/Minecraft authentication flow.

**User's stated product constraint:** local offline profiles only, not Microsoft login. Remove the incomplete Microsoft-auth path from the UI and command registry unless the product direction changes. Offline profiles should carry an explicit `offline_local` type, a validated Minecraft-compatible username, and no fake access/refresh token. Verify exact username constraints and UUID/session behavior against the chosen 1.8.9 launch path rather than assuming a hand-built profile authenticates. Persist only non-secret profile data atomically. State clearly that an unauthenticated profile is for local/offline use or servers explicitly configured to accept offline identities; it does not authenticate to online-mode servers such as Hypixel. Do not implement token spoofing or authentication bypass, or describe an offline profile as licensed/authenticated.

### 4.7 Diagnostics must not leak secrets

Sanitization regexes are not a substitute for not logging tokens in the first place. Redact auth fields before serialization, avoid logging complete sensitive URLs/query parameters, cap line/buffer lengths, and include tests with Bearer, Microsoft, Xbox, Minecraft access/refresh tokens, URL query secrets and crash output. Do not write tokens into `accounts.json` for offline-only profiles. Keep private signing keys and publish credentials only in protected GitHub environments; never put signing secrets into PR CI.

## 5. State, modules, profile, and UI correctness

### 5.1 Frontend bridge mocks can look like real success

`launcher/src/services/tauriBridge.ts` supplies mock values outside the Tauri runtime, including a fake local account, installed client, placeholder download/launch result, dummy PID, and fixed RAM data. A web preview may be helpful for design iteration, but it must have an unmistakable Preview/Mock Mode indicator and must never appear as the production app's operational state. Separate mock adapters from production code and add tests that make it impossible to ship mock responses as native results unintentionally.

### 5.2 Module schema mismatch

Rust and the frontend currently persist toggles by display name (`ClientPage.tsx` sends `moduleName: name`; `commands.rs` stores that string), while Java `ConfigManager` loads by Java module name. The default module names differ across layers in cases such as `FPS`/`FPS Display`, `CPS`/`CPS Display`, and `FastMath`/`FastMath Tables`. This makes the launcher-side value not map reliably to the Java module. More fundamentally, there is no live launcher-to-game configuration bridge today, so a successful Rust write is not proof that the running game changed.

**Fix:** establish a single stable registry keyed by machine IDs (e.g. `hud.fps`, `hud.cps`, `performance.entity_culling`, `bedwars.bed_status`) and keep display names strictly presentational. Define and validate a versioned JSON schema shared by frontend and native bridge. Migrate old keys, reject unknown keys gracefully, persist atomically, load at startup, and prove that a toggle changes a real in-game module after restart.

### 5.3 Profiles are mainly UI state, not effective game settings

`App.tsx` constructs profiles locally and `handleCreateProfile` / `handleDeleteProfile` only update React state. `ProfilesPage.tsx` then attempts save/delete best-effort, but the visible row can change even if persistence fails. The profile selected in app config isn't passed into a concrete game profile application path. The native profile read path also returns a generic BALANCED preset instead of faithfully loading every saved setting. Performance preset values for BALANCED, HIGH_FPS and ULTRA_FPS are currently identical in `PerformanceManager`.

**Fix:** make profile mutations asynchronous transactions: validate -> save to native storage -> update frontend only after success. Keep one documented schema containing all module/HUD/performance/resolution/resource-pack settings. On launch, load and apply the selected profile. Return the persisted profile from commands and show actionable save failures. Make presets meaningfully distinct, with explanations, or remove false distinctions until implemented. Add round-trip tests covering create/read/update/delete, invalid names, duplicate IDs, migration, app restart, selected profile application.

### 5.4 Curated mod catalog is hardcoded metadata, not verified compatibility

`get_curated_mods()` returns hardcoded names, versions, URLs, filenames, and estimated sizes without digest, loader, license, or a verifiable source manifest. The records include an OptiFine URL with a download query and several repository release URLs whose assets are not proven to exist in this checkout. The frontend preview duplicates a separate hardcoded catalog, so browser preview can disagree with native catalog state. Some advertised entries are third-party executable JARs and one describes automated Hypixel tipping. Treat each entry as untrusted until its provenance, current availability, license, loader compatibility, digest, and server-rule implications have been verified. Remove dead/unsupported entries and disallow installation until verification is implemented.

### 5.5 Documentation currently claims unsupported behavior

The README advertises a “verified” one-click installer, 26+ working Java modules, live telemetry, real-time process logs, working 1.8.9 controls, and an online trusted mod catalog. Source inspection does not support those claims: the launcher/runtime integration is missing, system RAM is hardcoded, the game process logs are not a reliable frontend stream, and mod downloads have no catalog integrity verification. Keep marketing claims and screenshots scoped to clearly marked preview functionality until each capability passes its acceptance test. Also explain the offline-profile limitation plainly; “offline-first” must not imply access to authenticated online-mode servers.

### 5.6 Launcher settings are largely state-only

Several preferences (e.g. auto-check updates, close launcher after launch, hardware-acceleration choice) live in frontend defaults and appear editable but are not reliably loaded/saved/applied. “Close launcher when game starts” is set true in default config but has no effective implementation. Decide each setting's semantics, persist it in native config, handle unavailable capabilities, and remove settings that cannot be honored. Closing should occur only after a real launch is confirmed and the user opted in; also provide a tray/minimize alternative if appropriate.

### 5.7 Real diagnostics, no hardcoded machine facts

`get_system_info()` returns constant `16384 MB` total memory and `8192 MB` free memory. Return actual OS, architecture, logical CPUs, total/available RAM, Java vendor/major/bitness, game/runtime version, active config and paths, with appropriate privacy controls. If the OS does not expose a value, return `unknown` rather than a plausible-looking constant. Don't run deep or expensive probes every 1.5 seconds.

### 5.8 UI quality criteria

The current launcher already has a React/Tailwind dark UI foundation; a full framework rewrite is not necessary. Improve it through:

- a small consistent design-token system for surface, border, typography, spacing, status, focus, and motion;
- consistent navigation/layout and responsive behavior at the minimum supported window size;
- loading, progress, success, error, empty, unsupported, offline, and retry states for every asynchronous page;
- no fabricated stats; no green “trusted/safe/installed” status unless a real verification result backs it;
- real accessible labels/keyboard focus and full keyboard navigation; visible focus and reduced-motion support;
- proper modal focus handling, escape behavior, and confirmation for destructive actions;
- clear Java/game profile diagnostics and “copy diagnostic report” without tokens;
- accessible contrast and consistent icon sizes, text hierarchy, spacing, and disabled/hover/focus states.

Aim for a clean original gaming utility interface inspired by modern PvP clients, not a pixel-perfect copy of proprietary Lunar/Feather artwork or branding.

### 5.9 Security and architecture documentation contradicts the implementation

At the original audit snapshot, `SECURITY.md` and related docs overstated credential storage, signed updates, path safety, and Microsoft/Xbox authentication. In the current working tree, account JSON contains metadata only and canonical containment is used by `verify_update_file`, but no credential vault, signature verifier, full auth flow, or complete install/download safety exists. Java detection still needs cross-platform validation. Treat policy and architecture claims as implementation-specific; remove placeholder reporting addresses such as `security@samratclient.internal` unless they are monitored (the current security policy directs users to GitHub private vulnerability reporting when available).

The schemas also do not currently describe the persisted data consistently: the profile schema requires `profileName`, `performancePreset`, and a nested `clientConfig`, while `save_custom_profile` writes `name`, `performancePreset`, and `createdAt`; the launcher config's schema declares a different camelCase shape from the Rust module-toggle file (`config.json`) and Java client config. Define separate, versioned schemas for launcher settings, game config, and profiles, and validate them at each serialization boundary. Do not claim a schema is enforced merely because a schema file exists.

## 6. Real feature integration plan

Treat every module as a feature with a declared integration status: `Preview`, `Implemented`, `Unsupported`, or `Error`. Do not show `Implemented` until a test proves it reads or changes real Minecraft state.

| Feature | Needed real integration | Minimum acceptance test |
|---|---|---|
| FPS / frame-time / 1% low | Sample actual frame intervals from render loop; fixed-size primitive ring buffer; no per-frame list copies/sorts | HUD follows a controlled frame cap and records sane frame-time percentiles. |
| Keystrokes / CPS | Actual input events; proper focus handling and reset on focus loss | Keys/clicks visually match real user inputs; no repeated stuck key after Alt-Tab. |
| Ping | Read live connection/network state only when connected | Shows unavailable in single player; otherwise updates from real connection data. |
| Coords/direction/armor/potions | Use actual world/player/inventory/effect APIs | Values match in-game values and update on world transitions. |
| Combo counter/hit color/reach display | Hook legit client attack/hit/target events; no packet modification | Tested in local test world against controlled events; no fake default values. |
| Freelook / zoom / 1.7 animations | Actual camera, FOV, animation hooks implemented through supported 1.8.9 APIs | Features toggle, reset correctly, and don't change server-side state. |
| Bed/status/resource timers | Must rely on actual world/packet/server data and documented supported server formats; clearly mark unknown when not observed | Tests with recorded fixtures plus a real private/local server; no hardcoded Bedwars status. |
| Texture packs | Integrate with game's actual resource-pack selection/scan/reload API; validate `pack.mcmeta` for 1.8.9 and use standard `resourcepacks/` directory | Install/preview/activate/deactivate/reload persists across restart and only reads bounded local archives. |
| Mods catalogue | Only show actual supported Forge 1.8.9 mods with pinned version, source, compatibility and SHA-256; validate install/uninstall/rollback | Known-good test mod loads, bad/incompatible/corrupt JAR is rejected with useful diagnostics. |
| Right-Shift ClickGUI | Real in-game screen / input binding, not Swing key listener | Opens/closes during actual 1.8.9 gameplay; doesn't trigger while typing in chat or break focus. |
| Resource use while playing | Release/minimize/exit native UI and background timers as configured; no webview polling during gameplay unless necessary | Measure idle CPU/RAM at launcher idle, minimized, and game running; document methodology. |

### Fair-play boundary

Build visual, accessibility, cosmetic, configuration, and measured performance features. Do not add server-side changes, packet manipulation intended to evade server rules, reach/aim/velocity cheats, anticheat bypass, automated combat, auth bypass, or stealth. Check the target server's rules before implementing chat automation (for example, AutoGG/AutoTip); make optional behavior transparent and user-controlled, or remove it if it conflicts with the intended server's rules.

## 7. Performance and memory: prove improvements, do not promise FPS

Do **not** rewrite the launcher in Rust/another language just because Rust is fashionable. The current split is sensible:

- **Rust/Tauri:** launcher process, installer, integrity validation, Java detection, process lifecycle, safe filesystem operations, updater, diagnostic collection.
- **TypeScript/React:** launcher interface and settings flows.
- **Java (for Minecraft 1.8.9 integration):** in-game renderer, HUD, key/input handling, mod lifecycle, Minecraft hooks. These features need actual game APIs and must execute inside the legacy Java game process.

The launcher and game are separate processes. Exiting the launcher after confirmed game startup can recover the launcher’s own RAM/CPU cost, but does not reduce Minecraft’s own runtime usage. Do not port Minecraft rendering/game hooks to Rust; it would require cross-language overhead and still would not avoid legacy Java APIs.

Specific fixes:

1. Remove `System.gc()` “defragment memory” calls from normal gameplay and remove misleading labels. JVM garbage collection is not heap defragmentation that should be triggered per preset; forced GC can cause frame spikes. Let the JVM manage GC unless a measured, reproducible issue justifies a controlled alternative.
2. Replace `FPSModule` history cloning and sorting on every tick with fixed-size primitive arrays/ring buffer and periodic percentile calculation. Measure **frame durations** from the render loop, not repeated FPS values sampled on game ticks.
3. `FastMath` initializes a 65,536-element lookup table (about 256 KiB plus array overhead) and includes methods that still delegate to `Math.sqrt`. Do not advertise these as proven accelerations. Compare against HotSpot/JIT `Math` with a microbenchmark representative of the real game hot path, validate NaN/infinity/overflow/negative input behavior, and keep only measured wins. Avoid fast inverse square root unless its error bounds are appropriate for each call site.
4. Benchmark the whole game client separately from the launcher. Track median/95th/99th frame time, frame pacing, Java heap/GC pause distribution, CPU, RAM, startup time, and background launcher CPU. Use fixed hardware/settings/replay scenes for manual GPU testing. GitHub-hosted VM FPS is not valid consumer-GPU evidence.
5. Set conservative heap defaults based on actual available RAM; avoid making Xms unnecessarily huge. Keep the user-facing cap within a safe range and validate it against OS architecture, physical memory, and the selected version. Explain that more allocated RAM is not always faster.
6. Avoid per-tick reflection, file I/O, network requests, large allocations, sorting or JSON parsing. Use immutable configuration snapshots and event-driven updates. Put work not required during the render tick on a bounded background executor, and never block the render thread on network/filesystem operations.
7. Ensure a quiet idle launcher when game is running: no unnecessary rapid polling, no live animation timer in a hidden preview window, no repeated full system scan, and configurable `Exit launcher after successful game startup` behavior.

**Requirement:** no performance claim (“+50% FPS”, “lowest CPU”, “better than Lunar”) without reproducible measurements against a published methodology. Optimize bottlenecks actually measured in the game, not code that looks slow.

## 8. Build/release/CI findings and target workflow design

### Current problems

- `.github/workflows/ci.yml` only runs `push` for `main`, `master`, `dev` and `pull_request` targeting `main`/`master`; other branches and PR targets do not receive the full standard checks.
- CI's npm cache dependency points to `launcher/package.json` instead of `launcher/package-lock.json`.
- `.github/workflows/launcher-build.yml` uses `npm install` rather than `npm ci`, has no pull-request trigger, and uses `npx tauri build || cargo build --release`. The fallback masks a failure in the actual Tauri bundle build. Artifact upload uses `if: always()` and ignores missing artifacts.
- `.github/workflows/client-build.yml` is path-filtered push/dispatch only and has no PR validation.
- `.github/workflows/dependency-review.yml` uses `continue-on-error: true`, so the dependency-review check cannot act as a blocking gate.
- `scripts/package_release.py` does not clean stale `dist` content first, can copy multiple JARs to one canonical file based on directory enumeration order, reports success when no real artifacts were built, and writes an empty `SHA256SUMS.txt` with exit code 0.
- Actions are referenced by mutable major tags, and most workflows lack explicit least-privilege `permissions`.

### Desired behavior (safe interpretation of “all pushes/branches/PRs”)

1. **Every push on every branch:** build/test/typecheck/lint/security checks and publish downloadable *workflow artifacts* tied to that exact commit, when the relevant target is supported.
2. **Every pull request from any target branch, including forks:** run the same read-only tests against PR code and upload diagnostics/artifacts; use `pull_request`, not a privileged `pull_request_target` workflow that checks out or runs untrusted PR code.
3. **Trusted main branch:** optionally publish a clearly labeled prerelease/nightly snapshot from trusted pushes, with an immutable commit SHA in the version. It must not overwrite stable release artifacts.
4. **Official stable GitHub Release:** publish only from a protected version tag (`vX.Y.Z`) or a deliberate manual approval. Do not create public “stable” releases from every fork PR/commit. This avoids giving untrusted code release/write credentials and prevents a flood of false releases.
5. Use `permissions: contents: read` by default; grant `contents: write` only to the final release job. Pin third-party actions to full reviewed commit SHAs, use lockfiles (`npm ci`), set concurrency groups, and keep signing keys/release secrets out of PR jobs. Official GitHub documentation covers push/PR workflow events, `pull_request_target` risks, and action pinning/least privilege (see references below).
6. CI must fail if the actual Tauri bundle build fails or if expected artifacts are missing. Never use an always-successful fallback to convert a packaging error into a green job. Use `if: always()` only for diagnostics and test report upload, not to hide build-artifact absence.
7. Verify artifact file types, sizes, hashes, manifest metadata, and signatures. Create a machine-readable artifact manifest with commit SHA, semantic version/channel, target OS/architecture, build toolchain, filename, byte size, and SHA-256. The checksum file itself must not include a checksum line for itself unless designed and documented explicitly.
8. Add supply-chain/security checks: CodeQL for supported languages, `cargo audit` and optionally `cargo deny`, npm audit/OSV scanning, Gradle dependency vulnerability scan, secret scan, dependency review, SBOM generation, archive/security unit tests. Treat vulnerabilities according to an explicit severity policy instead of permanently swallowing all findings.

## 9. Prioritized implementation roadmap

### Phase 0 — Stop misreporting and stabilize scope

- Mark current Swing app as Preview only; remove production fallback to it.
- Stop returning fake “running/installed/updated”/memory/FPS/ping stats.
- Make unsupported modules visibly Preview/Planned until real game integration is present.
- Lock offline-account scope and show the online-mode limitation.
- Add a health/diagnostics screen that reports factual state and useful errors.

**Exit gate:** no user action can mistake mock preview for launched Minecraft; all false status labels and fake live stats are removed from production path.

### Phase 1 — Establish reproducible CI as source of truth

- Fix triggers to run on all branch pushes and all PR targets.
- Make npm install reproducible via lockfile; fix native checks and actual Tauri build; fail on missing outputs.
- Add the proven 1.8.9 game-mod build to CI using the tested legacy-compatible toolchain.
- Make packaging deterministic and fail if required artifacts are missing.
- Use SHA-pinned actions and least privilege.

**Exit gate:** clean runner can reproduce frontend, native launcher, game mod, tests and package without local files/caches; every PR gets status checks; downloaded CI artifact opens/verifies.

### Phase 2 — Build an actual Minecraft 1.8.9 client integration

- Decide Forge vs direct LaunchWrapper/ASM after a minimal POC.
- Introduce real MC/loader dependencies, correct entry point, lifecycle hooks, input/render integration and version compatibility checks.
- Keep core event abstractions but ensure they're published by real game hooks; remove duplicate class definitions and enforce module boundaries.
- Replace Swing game mock as launch fallback; preserve it only as Preview mode if useful.

**Exit gate:** on a clean Windows CI worker, the artifact installs/launches a real Minecraft 1.8.9 instance and reaches the real main menu; integration diagnostics prove the client mod loaded; failure exits nonzero with actionable logs.

### Phase 3 — Secure official installer and runtime

- Parse official version metadata; fetch and verify client JAR, all required libraries, asset index/object files and correct natives; support only claimed target OS/arch.
- Secure download/cache/archive paths; cap sizes and use atomic writes.
- Fix Java detection and argument building; remove unsafe arbitrary URL and unsafe JVM args.
- Implement a trustworthy signed updater manifest tied to this repository and signed stable releases.
- Implement robust process state, output streaming, exit codes and termination.

**Exit gate:** clean-cache, partial-cache, corrupted-file, interrupted-download, offline/network-fail and concurrent-launch tests all behave deterministically with accurate error states.

### Phase 4 — Accounts/config/profiles and UI state

- Remove incomplete Microsoft sign-in code and tokens from offline mode.
- Implement offline profile validation/UUID semantics with no access tokens and explicit online-mode limitations.
- Unify module IDs/schema; persist settings/profiles with migrations and atomic writes.
- Apply saved profile/module settings to real game integration at startup; make all visible settings actually work or remove them.
- Introduce accurate metrics and live logs, accessible error/progress states, UI polish and preview-mode distinction.

**Exit gate:** settings and module toggles survive restart and demonstrably control the real client; account and profile operations have round-trip tests; no fabricated data shown in production.

### Phase 5 — Real feature set and measured performance

- Implement and test high-value essentials first: FPS/frame times, CPS, keystrokes, coordinates, armor/potions, crosshair, combo counter, zoom/freelook, keybinds and Right-Shift ClickGUI.
- Next: legitimate cosmetic animation/visual features, resource packs and compatible supported mods.
- Add Bedwars helpers only when backed by real state/integration. Unknown data should remain unknown.
- Profile every hot-path and demonstrate a measurable improvement before keeping an optimization.

**Exit gate:** every advertised feature has a test/behavior description and works in a real 1.8.9 session; frame pacing and memory metrics are measured on comparable hardware; no performance claim is unsupported.

## 10. Minimum acceptance checklist before calling the project “working”

- [ ] Build from a clean GitHub Actions runner; no generated local jar or stale `dist/` files required.
- [ ] Native launcher, real 1.8.9 client/mod, assets, libraries and natives are version-pinned and verified.
- [ ] Fresh install and subsequent offline launch both work in a real Minecraft instance.
- [ ] Broken/missing/corrupt client JAR, library, asset and native produces exact actionable diagnostic; never opens Swing preview instead.
- [ ] Two launch requests cannot spawn duplicates.
- [ ] Exiting/terminating the game updates UI and process state correctly; exit code and redacted log are visible.
- [ ] Downloaded mods/resource packs are size-bounded, checksum-validated, version-compatible and atomically installed; arbitrary frontend URL is impossible.
- [ ] All paths resist `..`, absolute paths, symlink/junction escapes and ZIP Slip.
- [ ] Updater verifies a trusted signature and digest; network outage is distinct from “up to date”; rollback/recovery works.
- [ ] Offline username validation, deterministic offline UUID and no fake token are covered by tests; no claim of premium authentication.
- [ ] All UI controls either persist and affect actual behavior or are disabled/removed; profiles work after restart.
- [ ] No mock telemetry in production.
- [ ] Tauri CSP and capabilities are least-privilege; dependency/security checks run and fail at agreed thresholds.
- [ ] Push to any branch and PR from any branch triggers checks; each eligible build exposes a commit-specific CI artifact; only authorized tags/releases can publish stable releases.
- [ ] Package job fails if required artifacts are missing; generated SHA-256 manifest matches the exact published binaries.
- [ ] HUD/feature functions pass in-game tests and don't implement cheats, server changes, authentication bypass or anti-cheat evasion.
- [ ] UI can run at minimum supported resolution with keyboard access, focus handling, clear progress/error/retry states and useful diagnostics.
- [ ] A real hardware test procedure documents game settings, hardware, Java version, baseline, post-change frame-time/FPS/CPU/RAM data and repeatability.

## 11. Validation boundary and evidence still needed

- Repository source, Tauri configuration/capabilities, Gradle/Cargo/npm manifests, CI workflows, and packaging scripts were inspected. Findings called confirmed are visible in those files; runtime behavior was not established by execution.
- No Gradle, Cargo, npm, packaging, installer, launcher, or Minecraft gameplay tests were run during this audit. There are no test-pass or build-pass claims here.
- Required next evidence: clean GitHub Actions builds from commit-specific checkouts; then a clean Windows install/launch smoke test of the real Minecraft 1.8.9 runtime, including a main-menu observation and one real HUD/module behavior. GPU performance claims require repeatable measurements on representative hardware, not CI VMs.
- Do not interpret missing runtime evidence as proof of a compile failure. The implementation prompt directs the coding agent to use GitHub Actions as the build environment per the user's requirement.

## 12. Primary external references

- GitHub repository snapshot: <https://github.com/GamingOP69/Launcher/tree/79af13ecb8549c72ca1c90835e99096d56329f94>
- Matching commit: <https://github.com/GamingOP69/Launcher/commit/79af13ecb8549c72ca1c90835e99096d56329f94>
- Repository landing page and Releases section observed during the web review: <https://github.com/GamingOP69/Launcher>
- Mojang version manifest (metadata source for a data-driven installer): <https://piston-meta.mojang.com/mc/game/version_manifest_v2.json>
- Forge 1.8.9 downloads/MDK: <https://files.minecraftforge.net/net/minecraftforge/forge/index_1.8.9.html>
- Mojang LegacyLauncher `ITweaker` implementation example: <https://github.com/Mojang/LegacyLauncher/blob/master/src/main/java/net/minecraft/launchwrapper/AlphaVanillaTweaker.java>
- Tauri Content Security Policy: <https://v2.tauri.app/security/csp/>
- Tauri capabilities and permissions: <https://tauri.app/security/capabilities/>
- Forge legacy loading stages (validate exact APIs against the 1.8.9 toolchain): <https://docs.minecraftforge.net/en/1.12.x/conventions/loadstages/>
- GitHub Actions workflow events/triggers: <https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows>
- GitHub Actions secure use and pinning/permissions: <https://docs.github.com/en/actions/reference/security/secure-use>
- GitHub `pull_request_target` security guidance: <https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target>
- Minecraft usage guidelines: <https://www.minecraft.net/en-us/usage-guidelines>
- Minecraft EULA: <https://www.minecraft.net/en-us/eula>
- Minecraft multiplayer account requirements: <https://www.minecraft.net/en-us/article/how-play-minecraft-server>

---

**Bottom line:** Keep Rust/Tauri for the launcher and process/download security, React/TypeScript for the launcher UI, and Java for the real 1.8.9 in-game mod. The urgent requirement is to establish and test the real game integration and secure installer; optimizing fake-render UI or porting everything to Rust will not make Minecraft work.
