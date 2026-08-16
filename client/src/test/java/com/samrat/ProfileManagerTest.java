package com.samrat;

import com.samrat.config.ConfigManager;
import com.samrat.config.ProfileManager;
import com.samrat.core.event.EventBus;
import com.samrat.core.module.ModuleManager;
import com.samrat.hud.HudManager;
import com.samrat.performance.PerformanceManager;
import com.samrat.performance.PerformancePreset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.File;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

public class ProfileManagerTest {
    @TempDir
    Path tempDir;

    private ProfileManager profileManager;
    private PerformanceManager performanceManager;

    @BeforeEach
    public void setup() {
        EventBus bus = new EventBus();
        ModuleManager modMgr = new ModuleManager(bus);
        HudManager hudMgr = new HudManager(bus, modMgr);
        performanceManager = new PerformanceManager();

        File configFile = tempDir.resolve("config.json").toFile();
        File profilesDir = tempDir.resolve("profiles").toFile();

        ConfigManager configManager = new ConfigManager(configFile, modMgr, hudMgr);
        profileManager = new ProfileManager(profilesDir, configManager, performanceManager);
        profileManager.initialize();
    }

    @Test
    public void testPresetRegistration() {
        assertFalse(profileManager.getProfiles().isEmpty());
        assertTrue(profileManager.getProfiles().stream().anyMatch(p -> p.name.equals("Bedwars")));
        assertTrue(profileManager.getProfiles().stream().anyMatch(p -> p.name.equals("PvP")));
    }

    @Test
    public void testProfileSwitching() {
        profileManager.applyProfile("FPS");
        assertEquals("FPS", profileManager.getActiveProfileName());
        assertEquals(PerformancePreset.HIGH_FPS, performanceManager.getActivePreset());
    }

    @Test
    public void testProfileExport() {
        File exportFile = tempDir.resolve("ExportedBedwars.json").toFile();
        boolean exported = profileManager.exportProfile("Bedwars", exportFile);

        assertTrue(exported);
        assertTrue(exportFile.exists());
        assertTrue(exportFile.length() > 0);
    }
}
