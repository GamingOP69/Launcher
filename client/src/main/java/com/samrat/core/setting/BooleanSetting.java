package com.samrat.core.setting;

public class BooleanSetting extends Setting<Boolean> {

    public BooleanSetting(String name, String description, boolean defaultValue) {
        super(name, description, defaultValue);
    }

    public void toggle() {
        setValue(!getValue());
    }

    @Override
    public String getSerializedValue() {
        return String.valueOf(getValue());
    }

    @Override
    public void deserializeValue(String serialized) {
        if (serialized != null) {
            setValue(Boolean.parseBoolean(serialized));
        }
    }
}
