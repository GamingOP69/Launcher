package com.samrat.hud;

public class HudPosition {
    private float x;
    private float y;
    private float width;
    private float height;
    private float scale;
    private String snappedTo;

    public HudPosition(float x, float y, float width, float height, float scale) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.snappedTo = "NONE";
    }

    public HudPosition(float x, float y, float width, float height) {
        this(x, y, width, height, 1.0f);
    }

    public float getX() {
        return x;
    }

    public void setX(float x) {
        this.x = x;
    }

    public float getY() {
        return y;
    }

    public void setY(float y) {
        this.y = y;
    }

    public float getWidth() {
        return width;
    }

    public void setWidth(float width) {
        this.width = width;
    }

    public float getHeight() {
        return height;
    }

    public void setHeight(float height) {
        this.height = height;
    }

    public float getScale() {
        return scale;
    }

    public void setScale(float scale) {
        this.scale = Math.max(0.5f, Math.min(2.5f, scale));
    }

    public String getSnappedTo() {
        return snappedTo;
    }

    public void setSnappedTo(String snappedTo) {
        this.snappedTo = snappedTo;
    }

    public void clampToBounds(int screenWidth, int screenHeight) {
        float scaledW = width * scale;
        float scaledH = height * scale;
        x = Math.max(2, Math.min(screenWidth - scaledW - 2, x));
        y = Math.max(2, Math.min(screenHeight - scaledH - 2, y));
    }
}
