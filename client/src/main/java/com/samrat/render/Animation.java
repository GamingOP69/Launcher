package com.samrat.render;

/**
 * Easing and interpolation helper for fluid, organic animations.
 */
public final class Animation {
    private float value;
    private float target;
    private final float speed;

    public Animation(float initial, float speed) {
        this.value = initial;
        this.target = initial;
        this.speed = speed;
    }

    public void update(float delta) {
        if (Math.abs(target - value) > 0.001f) {
            value += (target - value) * Math.min(1.0f, speed * delta);
        } else {
            value = target;
        }
    }

    public void setTarget(float target) {
        this.target = target;
    }

    public float getValue() {
        return value;
    }

    public float getTarget() {
        return target;
    }

    public static float easeOutQuad(float t) {
        return t * (2 - t);
    }

    public static float easeInOutCubic(float t) {
        return t < 0.5f ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    public static float lerp(float a, float b, float t) {
        return a + (b - a) * Math.max(0.0f, Math.min(1.0f, t));
    }
}
