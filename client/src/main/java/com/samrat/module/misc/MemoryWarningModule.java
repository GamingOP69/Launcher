package com.samrat.module.misc;

import com.samrat.core.event.EventListener;
import com.samrat.core.event.events.TickEvent;
import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.NumberSetting;
import com.samrat.render.ColorPalette;
import com.samrat.render.RenderUtils;

public class MemoryWarningModule extends Module {
    private final NumberSetting warningThresholdPercent = new NumberSetting("Threshold", "Memory usage percent to trigger alert", 90.0, 75.0, 98.0, 1.0, "%");

    private boolean alertActive = false;
    private long memoryUsedMb = 0;
    private long memoryMaxMb = 0;

    public MemoryWarningModule() {
        super("Memory Warning", "Alerts when JVM heap memory approaches maximum capacity", Category.MISC, 0, true);
        registerSetting(warningThresholdPercent);
    }

    @EventListener
    public void onTick(TickEvent event) {
        if (event.getPhase() != TickEvent.Phase.END) return;
        if (event.getTickCount() % 40 == 0) { // Check every 2 seconds
            Runtime rt = Runtime.getRuntime();
            this.memoryMaxMb = rt.maxMemory() / (1024 * 1024);
            long total = rt.totalMemory() / (1024 * 1024);
            long free = rt.freeMemory() / (1024 * 1024);
            this.memoryUsedMb = total - free;

            double usedPercent = memoryMaxMb > 0 ? ((double) memoryUsedMb / memoryMaxMb) * 100.0 : 0;
            this.alertActive = usedPercent >= warningThresholdPercent.getValue();
        }
    }

    public void renderAlertIfNeeded(int screenWidth, int screenHeight) {
        if (!isEnabled() || !alertActive) return;

        String warning = "⚠ HIGH MEMORY USAGE (" + memoryUsedMb + " MB / " + memoryMaxMb + " MB) ⚠";
        RenderUtils.drawCenteredString(warning, screenWidth / 2.0f, 40, ColorPalette.STATUS_DANGER, true);
    }

    public boolean isAlertActive() {
        return alertActive;
    }
}
