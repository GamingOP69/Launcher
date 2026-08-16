package com.samrat.module.visual;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.ModeSetting;
import com.samrat.core.setting.NumberSetting;

public class TimeChangerModule extends Module {
    private final ModeSetting mode = new ModeSetting("Time Mode", "World daylight time mode", "Day", "Day", "Sunset", "Night", "Custom", "Fast Cycle");
    private final NumberSetting customTime = new NumberSetting("Custom Time", "Exact ticks (0 - 24000)", 6000, 0, 24000, 500);

    public TimeChangerModule() {
        super("Time Changer", "Changes client-side world time of day independently of server", Category.VISUAL, 0, false);
        registerSetting(mode);
        registerSetting(customTime);
    }

    public long getClientWorldTime() {
        if (mode.is("Day")) return 6000L;
        if (mode.is("Sunset")) return 12500L;
        if (mode.is("Night")) return 18000L;
        if (mode.is("Custom")) return (long) customTime.getValue().doubleValue();
        if (mode.is("Fast Cycle")) return (System.currentTimeMillis() % 24000L);
        return 6000L;
    }
}
