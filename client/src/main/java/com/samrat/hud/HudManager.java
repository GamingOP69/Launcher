package com.samrat.hud;

import com.samrat.core.event.EventBus;
import com.samrat.core.event.EventListener;
import com.samrat.core.event.EventPriority;
import com.samrat.core.event.events.Render2DEvent;
import com.samrat.core.module.ModuleManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * HudManager manages the registration, coordinate positioning, and in-game rendering of all HUD modules.
 */
public final class HudManager {
    private static final Logger LOGGER = LoggerFactory.getLogger(HudManager.class);

    private final EventBus eventBus;
    private final ModuleManager moduleManager;
    private final Map<String, HudElement> elementMap = new ConcurrentHashMap<>();
    private final List<HudElement> elements = new ArrayList<>();
    private boolean inEditorMode = false;

    public HudManager(EventBus eventBus, ModuleManager moduleManager) {
        this.eventBus = eventBus;
        this.moduleManager = moduleManager;
        this.eventBus.register(this);
    }

    public void initialize() {
        LOGGER.info("Initializing Samrat HUD Subsystem...");
    }

    public void register(HudElement element) {
        if (element == null) return;
        elementMap.put(element.getId().toLowerCase(), element);
        elements.add(element);
    }

    @EventListener(priority = EventPriority.NORMAL)
    public void onRender2D(Render2DEvent event) {
        if (inEditorMode) {
            // When in interactive editor screen, editor renders them with guidelines
            return;
        }

        for (HudElement element : elements) {
            if (element.isVisible()) {
                try {
                    element.render(event.getPartialTicks());
                } catch (Exception e) {
                    LOGGER.error("Error rendering HUD element {}: {}", element.getId(), e.getMessage());
                }
            }
        }
    }

    public List<HudElement> getElements() {
        return Collections.unmodifiableList(elements);
    }

    public HudElement getElement(String id) {
        if (id == null) return null;
        return elementMap.get(id.toLowerCase());
    }

    public boolean isInEditorMode() {
        return inEditorMode;
    }

    public void setInEditorMode(boolean inEditorMode) {
        this.inEditorMode = inEditorMode;
    }
}
