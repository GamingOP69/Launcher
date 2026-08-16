package com.samrat.core.setting;

public class NumberSetting extends Setting<Double> {
    private final double min;
    private final double max;
    private final double increment;
    private final String suffix;

    public NumberSetting(String name, String description, double defaultValue, double min, double max, double increment, String suffix) {
        super(name, description, clamp(defaultValue, min, max));
        this.min = min;
        this.max = max;
        this.increment = increment;
        this.suffix = suffix;
    }

    public NumberSetting(String name, String description, double defaultValue, double min, double max, double increment) {
        this(name, description, defaultValue, min, max, increment, "");
    }

    @Override
    public void setValue(Double value) {
        if (value == null) {
            return;
        }
        double precision = 1.0 / increment;
        double rounded = Math.round(value * precision) / precision;
        super.setValue(clamp(rounded, min, max));
    }

    public double getMin() {
        return min;
    }

    public double getMax() {
        return max;
    }

    public double getIncrement() {
        return increment;
    }

    public String getSuffix() {
        return suffix;
    }

    public int getIntValue() {
        return getValue().intValue();
    }

    public float getFloatValue() {
        return getValue().floatValue();
    }

    private static double clamp(double val, double min, double max) {
        return Math.max(min, Math.min(max, val));
    }

    @Override
    public String getSerializedValue() {
        return String.valueOf(getValue());
    }

    @Override
    public void deserializeValue(String serialized) {
        if (serialized != null) {
            try {
                setValue(Double.parseDouble(serialized));
            } catch (NumberFormatException ignored) {}
        }
    }
}
