package com.samrat.performance;

/**
 * High-performance mathematical lookup tables and bitwise accelerators for Trigonometry,
 * Square Roots, Inverses, and Vector math. Eliminates expensive standard Math JNI calls.
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

    /**
     * Fast Inverse Square Root (Quake III / Carmack algorithm approximation).
     */
    public static float fastInvSqrt(float x) {
        float xhalf = 0.5f * x;
        int i = Float.floatToIntBits(x);
        i = 0x5f3759df - (i >> 1);
        x = Float.intBitsToFloat(i);
        x = x * (1.5f - xhalf * x * x);
        return x;
    }

    public static double hypot(double x, double y) {
        return Math.sqrt(x * x + y * y);
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

    public static float lerp(float a, float b, float t) {
        return a + t * (b - a);
    }

    public static double lerp(double a, double b, double t) {
        return a + t * (b - a);
    }

    public static float wrapAngleTo180(float value) {
        value = value % 360.0f;
        if (value >= 180.0f) {
            value -= 360.0f;
        }
        if (value < -180.0f) {
            value += 360.0f;
        }
        return value;
    }

    private FastMath() {}
}
