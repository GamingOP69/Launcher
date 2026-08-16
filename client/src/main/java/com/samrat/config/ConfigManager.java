package com.samrat.config;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.samrat.core.module.Module;
import com.samrat.core.module.ModuleManager;
import com.samrat.core.setting.Setting;
import com.samrat.hud.HudElement;
import com.samrat.hud.HudManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.charset.StandardCharsets;

public final class ConfigManager {
    private static final Logger LOGGER = LoggerFactory.getLogger(ConfigManager.class);
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    private final File configFile;
    private final File backupFile;
    private final ModuleManager moduleManager;
    private final HudManager hudManager;

    private int rightShiftKey = 54;
    private double uiScale = 1.0;
    private String accentColor = "#00F0FF";
    private String activeProfile = "Default";

    public ConfigManager(File configFile, ModuleManager moduleManager, HudManager hudManager) {
        this.configFile = configFile;
        this.backupFile = new File(configFile.getParentFile(), configFile.getName() + ".bak");
        this.moduleManager = moduleManager;
        this.hudManager = hudManager;
    }

    public synchronized void loadConfig() {
        if (!configFile.exists()) {
            LOGGER.info("No existing configuration found. Creating default config.");
            saveConfig();
            return;
        }

        try (Reader reader = new InputStreamReader(new FileInputStream(configFile), StandardCharsets.UTF_8)) {
            JsonObject root = JsonParser.parseReader(reader).getAsJsonObject();
            root = VersionMigrationHandler.migrate(root);

            if (root.has("rightShiftKey")) this.rightShiftKey = root.get("rightShiftKey").getAsInt();
            if (root.has("uiScale")) this.uiScale = root.get("uiScale").getAsDouble();
            if (root.has("accentColor")) this.accentColor = root.get("accentColor").getAsString();
            if (root.has("activeProfile")) this.activeProfile = root.get("activeProfile").getAsString();

            // Load Modules
            if (root.has("modules") && root.get("modules").isJsonObject()) {
                JsonObject modsObj = root.getAsJsonObject("modules");
                for (Module module : moduleManager.getModules()) {
                    if (modsObj.has(module.getName())) {
                        JsonObject modData = modsObj.getAsJsonObject(module.getName());
                        if (modData.has("enabled")) {
                            module.setEnabled(modData.get("enabled").getAsBoolean());
                        }
                        if (modData.has("keybind")) {
                            module.getKeybind().setValue(modData.get("keybind").getAsInt());
                        }
                        if (modData.has("settings") && modData.get("settings").isJsonObject()) {
                            JsonObject sObj = modData.getAsJsonObject("settings");
                            for (Setting<?> s : module.getSettings()) {
                                if (sObj.has(s.getName())) {
                                    s.deserializeValue(sObj.get(s.getName()).getAsString());
                                }
                            }
                        }
                    }
                }
            }

            // Load HUD Elements
            if (root.has("hudElements") && root.get("hudElements").isJsonObject()) {
                JsonObject hudObj = root.getAsJsonObject("hudElements");
                for (HudElement elem : hudManager.getElements()) {
                    if (hudObj.has(elem.getId())) {
                        JsonObject eData = hudObj.getAsJsonObject(elem.getId());
                        if (eData.has("x")) elem.getPosition().setX(eData.get("x").getAsFloat());
                        if (eData.has("y")) elem.getPosition().setY(eData.get("y").getAsFloat());
                        if (eData.has("scale")) elem.getPosition().setScale(eData.get("scale").getAsFloat());
                    }
                }
            }

            LOGGER.info("Configuration successfully loaded from {}", configFile.getAbsolutePath());
        } catch (Exception e) {
            LOGGER.error("Failed to parse config file: {}. Attempting recovery from backup...", e.getMessage());
            recoverBackup();
        }
    }

    public synchronized void saveConfig() {
        try {
            JsonObject root = new JsonObject();
            root.addProperty("configVersion", VersionMigrationHandler.CURRENT_CONFIG_VERSION);
            root.addProperty("activeProfile", activeProfile);
            root.addProperty("rightShiftKey", rightShiftKey);
            root.addProperty("uiScale", uiScale);
            root.addProperty("accentColor", accentColor);

            // Serialize Modules
            JsonObject modsObj = new JsonObject();
            for (Module module : moduleManager.getModules()) {
                JsonObject modData = new JsonObject();
                modData.addProperty("enabled", module.isEnabled());
                modData.addProperty("keybind", module.getKeybind().getValue());

                JsonObject sObj = new JsonObject();
                for (Setting<?> s : module.getSettings()) {
                    sObj.addProperty(s.getName(), s.getSerializedValue());
                }
                modData.add("settings", sObj);
                modsObj.add(module.getName(), modData);
            }
            root.add("modules", modsObj);

            // Serialize HUD Elements
            JsonObject hudObj = new JsonObject();
            for (HudElement elem : hudManager.getElements()) {
                JsonObject eData = new JsonObject();
                eData.addProperty("x", elem.getPosition().getX());
                eData.addProperty("y", elem.getPosition().getY());
                eData.addProperty("scale", elem.getPosition().getScale());
                hudObj.add(elem.getId(), eData);
            }
            root.add("hudElements", hudObj);

            // Create backup first
            if (configFile.exists()) {
                copyFile(configFile, backupFile);
            }

            // Write atomic config
            try (Writer writer = new OutputStreamWriter(new FileOutputStream(configFile), StandardCharsets.UTF_8)) {
                GSON.toJson(root, writer);
            }

            LOGGER.debug("Configuration saved successfully.");
        } catch (Exception e) {
            LOGGER.error("Error saving config: {}", e.getMessage(), e);
        }
    }

    private void recoverBackup() {
        if (backupFile.exists()) {
            try {
                copyFile(backupFile, configFile);
                LOGGER.info("Successfully restored config from backup file.");
                loadConfig();
            } catch (IOException ioException) {
                LOGGER.error("Failed to restore backup: {}", ioException.getMessage());
            }
        }
    }

    private static void copyFile(File src, File dest) throws IOException {
        try (InputStream in = new FileInputStream(src); OutputStream out = new FileOutputStream(dest)) {
            byte[] buf = new byte[8192];
            int len;
            while ((len = in.read(buf)) > 0) {
                out.write(buf, 0, len);
            }
        }
    }

    public int getRightShiftKey() {
        return rightShiftKey;
    }

    public void setRightShiftKey(int rightShiftKey) {
        this.rightShiftKey = rightShiftKey;
    }

    public double getUiScale() {
        return uiScale;
    }

    public void setUiScale(double uiScale) {
        this.uiScale = uiScale;
    }

    public String getAccentColor() {
        return accentColor;
    }

    public void setAccentColor(String accentColor) {
        this.accentColor = accentColor;
    }

    public String getActiveProfile() {
        return activeProfile;
    }

    public void setActiveProfile(String activeProfile) {
        this.activeProfile = activeProfile;
    }
}
