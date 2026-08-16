package com.samrat.core.module;

import com.samrat.core.event.EventBus;
import com.samrat.core.setting.KeybindSetting;
import com.samrat.core.setting.Setting;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Abstract base class for all Samrat Client modules.
 */
public abstract class Module {
    protected final Logger logger = LoggerFactory.getLogger(getClass());

    private final String name;
    private final String description;
    private final Category category;
    private final KeybindSetting keybind;
    private final List<Setting<?>> settings = new ArrayList<>();

    private boolean enabled;
    private EventBus eventBus;

    public Module(String name, String description, Category category, int defaultKeybind, boolean defaultEnabled) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.keybind = new KeybindSetting("Keybind", "Key to toggle " + name, defaultKeybind);
        this.enabled = defaultEnabled;
        registerSetting(this.keybind);
    }

    public Module(String name, String description, Category category) {
        this(name, description, category, KeybindSetting.KEY_NONE, false);
    }

    public void setEventBus(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    public void onInitialize() {}

    public void onEnable() {}

    public void onDisable() {}

    public void setEnabled(boolean enabled) {
        if (this.enabled == enabled) {
            return;
        }
        this.enabled = enabled;

        if (this.enabled) {
            if (eventBus != null) {
                eventBus.register(this);
            }
            try {
                onEnable();
            } catch (Exception e) {
                logger.error("Error in onEnable for module {}: {}", name, e.getMessage(), e);
            }
        } else {
            if (eventBus != null) {
                eventBus.unregister(this);
            }
            try {
                onDisable();
            } catch (Exception e) {
                logger.error("Error in onDisable for module {}: {}", name, e.getMessage(), e);
            }
        }
    }

    public void toggle() {
        setEnabled(!isEnabled());
    }

    public void registerSetting(Setting<?> setting) {
        if (setting != null && !settings.contains(setting)) {
            settings.add(setting);
        }
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Category getCategory() {
        return category;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public KeybindSetting getKeybind() {
        return keybind;
    }

    public List<Setting<?>> getSettings() {
        return Collections.unmodifiableList(settings);
    }

    public Setting<?> getSettingByName(String settingName) {
        for (Setting<?> setting : settings) {
            if (setting.getName().equalsIgnoreCase(settingName)) {
                return setting;
            }
        }
        return null;
    }
}
