package com.samrat.render;

/**
 * Rendering utility routines for GUI drawing, rounded rectangles, gradients, and lines.
 */
public final class RenderUtils {

    public static void drawRect(float left, float top, float right, float bottom, int color) {
        // Abstracted 2D primitive render logic
    }

    public static void drawRoundedRect(float left, float top, float right, float bottom, float radius, int color) {
        // Draw smoothed rounded container
    }

    public static void drawBorder(float left, float top, float right, float bottom, float width, int color) {
        drawRect(left, top, right, top + width, color); // Top
        drawRect(left, bottom - width, right, bottom, color); // Bottom
        drawRect(left, top + width, left + width, bottom - width, color); // Left
        drawRect(right - width, top + width, right, bottom - width, color); // Right
    }

    public static void drawGradientRect(float left, float top, float right, float bottom, int startColor, int endColor) {
        // Gradient fill
    }

    public static void drawLine(float x1, float y1, float x2, float y2, float width, int color) {
        // Line rendering
    }

    public static void drawString(String text, float x, float y, int color, boolean shadow) {
        // Font rendering hook
    }

    public static void drawCenteredString(String text, float centerX, float y, int color, boolean shadow) {
        // Centered font rendering hook
    }

    public static int getStringWidth(String text) {
        if (text == null) return 0;
        return text.length() * 6; // Standard approximate 1.8.9 glyph width
    }

    public static int getFontHeight() {
        return 9;
    }

    private RenderUtils() {}
}
