package com.samrat.core.setting;

import java.util.Arrays;
import java.util.List;

public class ModeSetting extends Setting<String> {
    private final List<String> modes;

    public ModeSetting(String name, String description, String defaultMode, String... modes) {
        super(name, description, defaultMode);
        this.modes = Arrays.asList(modes);
        if (!this.modes.contains(defaultMode)) {
            throw new IllegalArgumentException("Default mode " + defaultMode + " must be one of " + this.modes);
        }
    }

    public List<String> getModes() {
        return modes;
    }

    public void cycle() {
        int index = modes.indexOf(getValue());
        int nextIndex = (index + 1) % modes.size();
        setValue(modes.get(nextIndex));
    }

    public boolean is(String mode) {
        return getValue() != null && getValue().equalsIgnoreCase(mode);
    }

    @Override
    public void setValue(String value) {
        if (value != null && modes.contains(value)) {
            super.setValue(value);
        }
    }

    @Override
    public String getSerializedValue() {
        return getValue();
    }

    @Override
    public void deserializeValue(String serialized) {
        if (serialized != null && modes.contains(serialized)) {
            setValue(serialized);
        }
    }
}
