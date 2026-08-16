package com.samrat.core;

import com.samrat.config.ConfigManager;
import com.samrat.config.ProfileManager;
import com.samrat.core.event.EventBus;
import com.samrat.core.event.events.ClientInitEvent;
import com.samrat.core.event.events.ClientShutdownEvent;
import com.samrat.core.module.ModuleManager;
import com.samrat.diagnostics.CrashReporter;
import com.samrat.diagnostics.LogManager;
import com.samrat.hud.HudManager;
import com.samrat.performance.PerformanceManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

/**
 * SamratCore is the central coordinator for all core client subsystems:
 * EventBus, ModuleManager, ConfigManager, ProfileManager, HudManager,
 * PerformanceManager, Diagnostics, and Logging.
 */
public final class SamratCore {
    private static final Logger LOGGER = LoggerFactory.getLogger(SamratCore.class);

    private final EventBus eventBus;
    private final ModuleManager moduleManager;
    private final ConfigManager configManager;
    private final ProfileManager profileManager;
    private final HudManager hudManager;
    private final PerformanceManager performanceManager;
    private final CrashReporter crashReporter;
    private final LogManager logManager;

    private final File dataDirectory;

    public SamratCore() {
        this.dataDirectory = new File(System.getProperty("user.home"), ".samrat");
        if (!dataDirectory.exists()) {
            dataDirectory.mkdirs();
        }

        this.eventBus = new EventBus();
        this.logManager = new LogManager(new File(dataDirectory, "logs"));
        this.crashReporter = new CrashReporter(new File(dataDirectory, "crashes"));
        this.performanceManager = new PerformanceManager();
        this.moduleManager = new ModuleManager(eventBus);
        this.hudManager = new HudManager(eventBus, moduleManager);
        this.configManager = new ConfigManager(new File(dataDirectory, "config.json"), moduleManager, hudManager);
        this.profileManager = new ProfileManager(new File(dataDirectory, "profiles"), configManager, performanceManager);
    }

    public void initialize() {
        LOGGER.info("Starting Samrat Core subsystems...");

        // 1. Initialize Log Manager
        logManager.initialize();

        // 2. Initialize Performance Engine & lookup tables
        performanceManager.initialize();

        // 3. Register default modules
        moduleManager.initializeDefaultModules();

        // 4. Initialize HUD system
        hudManager.initialize();

        // 5. Load Active Config & Profiles
        profileManager.initialize();
        configManager.loadConfig();

        // 6. Post ClientInitEvent
        eventBus.post(new ClientInitEvent());

        LOGGER.info("Samrat Core subsystems initialized successfully.");
    }

    public void shutdown() {
        LOGGER.info("Shutting down Samrat Core subsystems...");
        
        // Post ClientShutdownEvent
        eventBus.post(new ClientShutdownEvent());

        // Persist configs
        configManager.saveConfig();
        profileManager.saveActiveProfile();

        // Disable all modules cleanly
        moduleManager.shutdown();

        // Flush logs
        logManager.shutdown();

        LOGGER.info("Samrat Core subsystems shutdown cleanly.");
    }

    public EventBus getEventBus() {
        return eventBus;
    }

    public ModuleManager getModuleManager() {
        return moduleManager;
    }

    public ConfigManager getConfigManager() {
        return configManager;
    }

    public ProfileManager getProfileManager() {
        return profileManager;
    }

    public HudManager getHudManager() {
        return hudManager;
    }

    public PerformanceManager getPerformanceManager() {
        return performanceManager;
    }

    public CrashReporter getCrashReporter() {
        return crashReporter;
    }

    public LogManager getLogManager() {
        return logManager;
    }

    public File getDataDirectory() {
        return dataDirectory;
    }
}
