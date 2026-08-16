package com.samrat;

import com.samrat.core.event.EventBus;
import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.module.ModuleManager;
import com.samrat.module.hud.FPSModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ModuleManagerTest {
    private EventBus eventBus;
    private ModuleManager moduleManager;

    @BeforeEach
    public void setup() {
        eventBus = new EventBus();
        moduleManager = new ModuleManager(eventBus);
    }

    @Test
    public void testDefaultModulesRegistration() {
        moduleManager.initializeDefaultModules();

        assertTrue(moduleManager.getModules().size() >= 20, "Expected at least 20 modules registered across categories");
        assertNotNull(moduleManager.getModule(FPSModule.class));
        assertNotNull(moduleManager.getModuleByName("FPS"));
        assertNotNull(moduleManager.getModuleByName("Bed Status"));
    }

    @Test
    public void testCategoryFilteringAndSearch() {
        moduleManager.initializeDefaultModules();

        List<Module> hudMods = moduleManager.getModulesByCategory(Category.HUD);
        assertFalse(hudMods.isEmpty());
        for (Module m : hudMods) {
            assertEquals(Category.HUD, m.getCategory());
        }

        List<Module> searchResults = moduleManager.searchModules("bed");
        assertFalse(searchResults.isEmpty());
        assertTrue(searchResults.stream().anyMatch(m -> m.getName().equalsIgnoreCase("Bed Status")));
    }

    @Test
    public void testModuleToggleAndSettings() {
        FPSModule fps = new FPSModule();
        moduleManager.register(fps);

        fps.setEnabled(false);
        assertFalse(fps.isEnabled());

        fps.toggle();
        assertTrue(fps.isEnabled());

        assertNotNull(fps.getSettingByName("1% Low"));
    }
}
