package com.samrat.config;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.samrat.performance.PerformanceManager;
import com.samrat.performance.PerformancePreset;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public final class ProfileManager {
    private static final Logger LOGGER = LoggerFactory.getLogger(ProfileManager.class);
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    private final File profilesDir;
    private final ConfigManager configManager;
    private final PerformanceManager performanceManager;

    private final Map<String, ProfileData> profiles = new LinkedHashMap<>();
    private String activeProfileName = "Default";

    public static final class ProfileData {
        public String name;
        public String description;
        public boolean isPreset;
        public PerformancePreset performancePreset;

        public ProfileData(String name, String description, boolean isPreset, PerformancePreset performancePreset) {
            this.name = name;
            this.description = description;
            this.isPreset = isPreset;
            this.performancePreset = performancePreset;
        }
    }

    public ProfileManager(File profilesDir, ConfigManager configManager, PerformanceManager performanceManager) {
        this.profilesDir = profilesDir;
        this.configManager = configManager;
        this.performanceManager = performanceManager;
    }

    public void initialize() {
        if (!profilesDir.exists()) {
            profilesDir.mkdirs();
        }

        // Register default presets
        registerPreset("Default", "Standard balanced client configuration", PerformancePreset.BALANCED);
        registerPreset("Bedwars", "Optimized HUD, team trackers and resource timers", PerformancePreset.BALANCED);
        registerPreset("PvP", "Aggressive combo tracking, custom crosshair & high visibility", PerformancePreset.HIGH_FPS);
        registerPreset("FPS", "Maximum frame rate tuning with aggressive entity culling", PerformancePreset.HIGH_FPS);
        registerPreset("Low-End PC", "Ultra-lightweight settings for potato PCs", PerformancePreset.ULTRA_FPS);

        loadCustomProfilesFromDisk();
    }

    public void registerPreset(String name, String description, PerformancePreset preset) {
        profiles.put(name, new ProfileData(name, description, true, preset));
    }

    public void applyProfile(String profileName) {
        if (!profiles.containsKey(profileName)) {
            LOGGER.warn("Profile {} not found. Falling back to Default.", profileName);
            profileName = "Default";
        }

        this.activeProfileName = profileName;
        configManager.setActiveProfile(profileName);

        ProfileData data = profiles.get(profileName);
        if (data != null && data.performancePreset != null) {
            performanceManager.applyPreset(data.performancePreset);
        }

        LOGGER.info("Switched to active profile: {}", profileName);
    }

    public void saveActiveProfile() {
        configManager.saveConfig();
    }

    public boolean exportProfile(String profileName, File destinationFile) {
        ProfileData data = profiles.get(profileName);
        if (data == null) return false;

        try (Writer writer = new OutputStreamWriter(new FileOutputStream(destinationFile), StandardCharsets.UTF_8)) {
            JsonObject exportObj = new JsonObject();
            exportObj.addProperty("profileName", data.name);
            exportObj.addProperty("description", data.description);
            exportObj.addProperty("performancePreset", data.performancePreset.name());
            GSON.toJson(exportObj, writer);
            return true;
        } catch (Exception e) {
            LOGGER.error("Failed to export profile {}: {}", profileName, e.getMessage());
            return false;
        }
    }

    public boolean importProfile(File sourceFile) {
        if (!sourceFile.exists()) return false;

        try (Reader reader = new InputStreamReader(new FileInputStream(sourceFile), StandardCharsets.UTF_8)) {
            JsonObject root = JsonParser.parseReader(reader).getAsJsonObject();
            if (!root.has("profileName")) return false;

            String name = root.get("profileName").getAsString();
            String desc = root.has("description") ? root.get("description").getAsString() : "Imported Profile";
            String presetStr = root.has("performancePreset") ? root.get("performancePreset").getAsString() : "BALANCED";

            PerformancePreset preset = PerformancePreset.valueOf(presetStr);
            profiles.put(name, new ProfileData(name, desc, false, preset));
            LOGGER.info("Successfully imported profile: {}", name);
            return true;
        } catch (Exception e) {
            LOGGER.error("Failed to import profile from {}: {}", sourceFile.getName(), e.getMessage());
            return false;
        }
    }

    private void loadCustomProfilesFromDisk() {
        File[] files = profilesDir.listFiles((dir, name) -> name.endsWith(".json"));
        if (files != null) {
            for (File file : files) {
                importProfile(file);
            }
        }
    }

    public List<ProfileData> getProfiles() {
        return new ArrayList<>(profiles.values());
    }

    public String getActiveProfileName() {
        return activeProfileName;
    }
}
