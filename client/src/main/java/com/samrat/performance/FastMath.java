package com.samrat.performance;

/**
 * High-performance mathematical lookup tables for Trigonometry (Sin/Cos) and Sqrt,
 * eliminating thousands of expensive standard Math calls per frame.
 */
public final class FastMath {
    private static final int TABLE_SIZE = 65536;
    private static final float[] SIN_TABLE = new float[TABLE_SIZE];
    private static final float RAD_TO_INDEX = (float) (TABLE_SIZE / (Math.PI * 2.0));

    static {
        for (int i = 0; i < TABLE_SIZE; ++i) {
            SIN_TABLE[i] = (float) Math.sin((double) i * Math.PI * 2.0 / (double) TABLE_SIZE);
        }
    }

    public static float sin(float rad) {
        return SIN_TABLE[(int) (rad * RAD_TO_INDEX) & 65535];
    }

    public static float cos(float rad) {
        return SIN_TABLE[(int) (rad * RAD_TO_INDEX + 16384.0f) & 65535];
    }

    public static float sqrt(float value) {
        return (float) Math.sqrt(value);
    }

    public static int floor(double value) {
        int i = (int) value;
        return value < (double) i ? i - 1 : i;
    }

    public static int ceil(double value) {
        int i = (int) value;
        return value > (double) i ? i + 1 : i;
    }

    public static float clamp(float num, float min, float max) {
        return num < min ? min : (num > max ? max : num);
    }

    public static double clamp(double num, double min, double max) {
        return num < min ? min : (num > max ? max : num);
    }

    private FastMath() {}
}
