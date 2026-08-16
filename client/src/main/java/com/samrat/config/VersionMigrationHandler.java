package com.samrat.config;

import com.google.gson.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Handles automatic schema migrations for user configuration files.
 */
public final class VersionMigrationHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(VersionMigrationHandler.class);
    public static final int CURRENT_CONFIG_VERSION = 2;

    public static JsonObject migrate(JsonObject rawConfig) {
        if (rawConfig == null) {
            rawConfig = new JsonObject();
        }

        int version = rawConfig.has("configVersion") ? rawConfig.get("configVersion").getAsInt() : 1;

        if (version < 2) {
            LOGGER.info("Migrating configuration from v{} to v2...", version);
            rawConfig = migrateV1ToV2(rawConfig);
            version = 2;
        }

        rawConfig.addProperty("configVersion", version);
        return rawConfig;
    }

    private static JsonObject migrateV1ToV2(JsonObject v1) {
        JsonObject v2 = v1.deepCopy();

        // Ensure activeProfile exists
        if (!v2.has("activeProfile")) {
            v2.addProperty("activeProfile", "Default");
        }

        // Ensure rightShiftKey exists (54 is default LWJGL RSHIFT)
        if (!v2.has("rightShiftKey")) {
            v2.addProperty("rightShiftKey", 54);
        }

        // Ensure uiScale exists
        if (!v2.has("uiScale")) {
            v2.addProperty("uiScale", 1.0);
        }

        // Ensure accentColor exists
        if (!v2.has("accentColor")) {
            v2.addProperty("accentColor", "#00F0FF");
        }

        // Structure modules object
        if (!v2.has("modules") || !v2.get("modules").isJsonObject()) {
            v2.add("modules", new JsonObject());
        }

        // Structure hudElements object
        if (!v2.has("hudElements") || !v2.get("hudElements").isJsonObject()) {
            v2.add("hudElements", new JsonObject());
        }

        v2.addProperty("configVersion", 2);
        return v2;
    }

    private VersionMigrationHandler() {}
}
