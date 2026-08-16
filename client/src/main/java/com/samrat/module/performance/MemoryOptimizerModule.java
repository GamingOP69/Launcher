package com.samrat.module.performance;

import com.samrat.core.event.EventListener;
import com.samrat.core.event.events.TickEvent;
import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.NumberSetting;

public class MemoryOptimizerModule extends Module {
    private final NumberSetting intervalMinutes = new NumberSetting("Defrag Interval", "Minutes between automatic memory cleanup", 5.0, 1.0, 15.0, 1.0, "m");

    public MemoryOptimizerModule() {
        super("Memory Optimizer", "Periodic memory defragmentation preventing stutter and memory leaks", Category.PERFORMANCE, 0, true);
        registerSetting(intervalMinutes);
    }

    @EventListener
    public void onTick(TickEvent event) {
        if (event.getPhase() != TickEvent.Phase.END) return;
        long intervalTicks = (long) (intervalMinutes.getValue() * 60 * 20);
        if (event.getTickCount() > 0 && event.getTickCount() % intervalTicks == 0) {
            System.gc();
            logger.debug("Automated memory defragmentation performed.");
        }
    }
}
