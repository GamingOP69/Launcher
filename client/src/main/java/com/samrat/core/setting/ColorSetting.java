package com.samrat.core.setting;

public class ColorSetting extends Setting<Integer> {
    private final boolean hasAlpha;

    public ColorSetting(String name, String description, int defaultRgba, boolean hasAlpha) {
        super(name, description, defaultRgba);
        this.hasAlpha = hasAlpha;
    }

    public ColorSetting(String name, String description, int defaultRgb) {
        this(name, description, defaultRgb, false);
    }

    public int getRed() {
        return (getValue() >> 16) & 0xFF;
    }

    public int getGreen() {
        return (getValue() >> 8) & 0xFF;
    }

    public int getBlue() {
        return getValue() & 0xFF;
    }

    public int getAlpha() {
        return hasAlpha ? ((getValue() >> 24) & 0xFF) : 255;
    }

    public String getHex() {
        if (hasAlpha) {
            return String.format("#%08X", getValue());
        }
        return String.format("#%06X", getValue() & 0xFFFFFF);
    }

    @Override
    public String getSerializedValue() {
        return getHex();
    }

    @Override
    public void deserializeValue(String serialized) {
        if (serialized != null && serialized.startsWith("#")) {
            try {
                long val = Long.parseLong(serialized.substring(1), 16);
                setValue((int) val);
            } catch (NumberFormatException ignored) {}
        }
    }
}
