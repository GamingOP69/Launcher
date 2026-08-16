package com.samrat;

import com.google.gson.JsonObject;
import com.samrat.config.VersionMigrationHandler;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ConfigMigrationTest {

    @Test
    public void testMigrateV1ToV2() {
        JsonObject v1 = new JsonObject();
        v1.addProperty("configVersion", 1);
        v1.addProperty("activeProfile", "Custom");

        JsonObject v2 = VersionMigrationHandler.migrate(v1);

        assertEquals(2, v2.get("configVersion").getAsInt());
        assertEquals("Custom", v2.get("activeProfile").getAsString());
        assertTrue(v2.has("modules"));
        assertTrue(v2.has("hudElements"));
        assertTrue(v2.has("rightShiftKey"));
        assertTrue(v2.has("uiScale"));
        assertTrue(v2.has("accentColor"));
    }

    @Test
    public void testEmptyConfigMigration() {
        JsonObject empty = new JsonObject();
        JsonObject migrated = VersionMigrationHandler.migrate(empty);

        assertEquals(2, migrated.get("configVersion").getAsInt());
        assertEquals("Default", migrated.get("activeProfile").getAsString());
    }
}
