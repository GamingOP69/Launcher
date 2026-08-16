package com.samrat.module.visual;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.NumberSetting;

/**
 * Lowers on-screen fire overlay during lava and fire combat so vision remains unobstructed in PvP.
 */
public final class LowFireModule extends Module {
    private final NumberSetting fireHeightOffset;

    public LowFireModule() {
        super("Low Fire", "Lowers the first-person fire rendering overlay during combat", Category.VISUAL);
        this.fireHeightOffset = new NumberSetting("Height Offset", "Downward offset for the fire overlay", 0.45, 0.1, 0.8, 0.05);

        registerSetting(fireHeightOffset);
        setEnabled(true);
    }

    public double getFireHeightOffset() {
        return fireHeightOffset.getValue();
    }
}
