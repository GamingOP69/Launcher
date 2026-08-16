package com.samrat.module.player;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;

public class FreelookModule extends Module {
    private final BooleanSetting invertPitch = new BooleanSetting("Invert Pitch", "Invert vertical look direction in freelook", false);

    private boolean active = false;
    private float freeYaw = 0.0f;
    private float freePitch = 0.0f;

    public FreelookModule() {
        super("Freelook", "Perspective 360-degree camera rotation without altering player head heading", Category.PLAYER, 47, false); // Default key 'V'
        registerSetting(invertPitch);
    }

    public boolean isActive() {
        return isEnabled() && active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public float getFreeYaw() {
        return freeYaw;
    }

    public void setFreeYaw(float freeYaw) {
        this.freeYaw = freeYaw;
    }

    public float getFreePitch() {
        return freePitch;
    }

    public void setFreePitch(float freePitch) {
        this.freePitch = freePitch;
    }
}
