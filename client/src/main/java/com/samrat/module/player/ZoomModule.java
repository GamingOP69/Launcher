package com.samrat.module.player;

import com.samrat.core.event.EventListener;
import com.samrat.core.event.events.TickEvent;
import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.core.setting.NumberSetting;

/**
 * OptiFine-style smooth zoom module with customizable zoom factor and smooth cinematic FOV transitions.
 */
public final class ZoomModule extends Module {
    private final NumberSetting zoomFactor;
    private final BooleanSetting smoothCamera;
    private boolean isZooming = false;
    private float currentFovMultiplier = 1.0f;

    public ZoomModule() {
        super("OptiFine Zoom", "Enables smooth cinematic zoom with customizable magnification factor (Default: C key)", Category.PLAYER);
        this.getKeybind().setValue(46); // Default: C key
        this.zoomFactor = new NumberSetting("Zoom Factor", "Magnification level when zooming", 4.0, 2.0, 10.0, 0.5);
        this.smoothCamera = new BooleanSetting("Cinematic Camera", "Smooths mouse movement while zooming", true);

        registerSetting(zoomFactor);
        registerSetting(smoothCamera);
        setEnabled(true);
    }

    @EventListener
    public void onTick(TickEvent event) {
        float target = isZooming ? (1.0f / zoomFactor.getFloatValue()) : 1.0f;
        // Smooth linear interpolation (lerp) toward target FOV
        currentFovMultiplier += (target - currentFovMultiplier) * 0.25f;
    }

    public boolean isZooming() {
        return isZooming;
    }

    public void setZooming(boolean zooming) {
        this.isZooming = zooming;
    }

    public float getCurrentFovMultiplier() {
        return currentFovMultiplier;
    }

    public boolean isSmoothCamera() {
        return smoothCamera.getValue();
    }
}
