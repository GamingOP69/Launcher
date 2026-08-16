package com.samrat.core.module;

import com.samrat.core.event.EventBus;
import com.samrat.core.event.EventListener;
import com.samrat.core.event.events.KeyboardEvent;
import com.samrat.module.bedwars.*;
import com.samrat.module.hud.*;
import com.samrat.module.performance.*;
import com.samrat.module.player.*;
import com.samrat.module.pvp.*;
import com.samrat.module.visual.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Registry and lifecycle manager for all client modules.
 */
public final class ModuleManager {
    private static final Logger LOGGER = LoggerFactory.getLogger(ModuleManager.class);

    private final EventBus eventBus;
    private final Map<Class<? extends Module>, Module> moduleClassMap = new ConcurrentHashMap<>();
    private final Map<String, Module> moduleNameMap = new ConcurrentHashMap<>();
    private final List<Module> modules = new ArrayList<>();

    public ModuleManager(EventBus eventBus) {
        this.eventBus = eventBus;
        this.eventBus.register(this);
    }

    public void register(Module module) {
        if (module == null) return;

        module.setEventBus(eventBus);
        try {
            module.onInitialize();
        } catch (Exception e) {
            LOGGER.error("Error initializing module {}: {}", module.getName(), e.getMessage(), e);
        }

        moduleClassMap.put(module.getClass(), module);
        moduleNameMap.put(module.getName().toLowerCase(), module);
        modules.add(module);

        if (module.isEnabled()) {
            eventBus.register(module);
            try {
                module.onEnable();
            } catch (Exception e) {
                LOGGER.error("Error enabling module {}: {}", module.getName(), e.getMessage(), e);
            }
        }
    }

    public void initializeDefaultModules() {
        LOGGER.info("Registering default Samrat Client modules...");

        // HUD Modules
        register(new FPSModule());
        register(new CPSModule());
        register(new PingModule());
        register(new KeystrokesModule());
        register(new ArmorStatusModule());
        register(new PotionStatusModule());
        register(new CoordsModule());
        register(new DirectionModule());
        register(new ServerInfoModule());
        register(new ClockModule());

        // PvP Modules
        register(new ComboCounterModule());
        register(new HitColorModule());
        register(new CrosshairModule());
        register(new ToggleSprintModule());
        register(new ReachDisplayModule());

        // Bedwars Modules
        register(new BedStatusModule());
        register(new TeamStatusModule());
        register(new ResourceTimerModule());
        register(new HeightAlertModule());
        register(new BedwarsHUDModule());

        // Performance Modules
        register(new PerformanceEngineModule());
        register(new FastMathModule());
        register(new EntityCullingModule());
        register(new ParticleOptimizerModule());
        register(new MemoryOptimizerModule());
        register(new SmartAnimationsModule());

        // Visual Modules
        register(new MotionBlurModule());
        register(new TimeChangerModule());
        register(new BlockOverlayModule());
        register(new ItemPhysicsModule());

        // Player / Misc Modules
        register(new FreelookModule());
        register(new AutoGGModule());
        register(new ChatCustomizerModule());
        register(new com.samrat.module.misc.ScreenshotManagerModule());
        register(new com.samrat.module.misc.CustomScoreboardModule());
        register(new com.samrat.module.misc.TabListCustomizerModule());
        register(new com.samrat.module.misc.MemoryWarningModule());

        LOGGER.info("Registered {} modules across 8 categories.", modules.size());
    }

    @EventListener
    public void onKey(KeyboardEvent event) {
        if (!event.isPressed() || event.getKeyCode() <= 0) {
            return;
        }

        for (Module module : modules) {
            if (module.getKeybind().isBound() && module.getKeybind().getValue() == event.getKeyCode()) {
                module.toggle();
                LOGGER.debug("Module {} toggled via keybind: {}", module.getName(), module.isEnabled());
            }
        }
    }

    @SuppressWarnings("unchecked")
    public <T extends Module> T getModule(Class<T> clazz) {
        return (T) moduleClassMap.get(clazz);
    }

    public Module getModuleByName(String name) {
        if (name == null) return null;
        return moduleNameMap.get(name.toLowerCase());
    }

    public List<Module> getModules() {
        return Collections.unmodifiableList(modules);
    }

    public List<Module> getModulesByCategory(Category category) {
        return modules.stream()
                .filter(m -> m.getCategory() == category)
                .collect(Collectors.toList());
    }

    public List<Module> searchModules(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getModules();
        }
        String clean = query.trim().toLowerCase();
        return modules.stream()
                .filter(m -> m.getName().toLowerCase().contains(clean) || m.getDescription().toLowerCase().contains(clean))
                .collect(Collectors.toList());
    }

    public void shutdown() {
        for (Module module : modules) {
            if (module.isEnabled()) {
                try {
                    module.onDisable();
                } catch (Exception ignored) {}
            }
        }
    }
}
