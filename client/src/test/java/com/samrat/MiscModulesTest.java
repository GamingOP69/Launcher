package com.samrat;

import com.samrat.core.event.EventBus;
import com.samrat.core.event.events.TickEvent;
import com.samrat.module.misc.CustomScoreboardModule;
import com.samrat.module.misc.MemoryWarningModule;
import com.samrat.module.misc.ScreenshotManagerModule;
import com.samrat.module.misc.TabListCustomizerModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class MiscModulesTest {
    private EventBus eventBus;

    @BeforeEach
    public void setup() {
        eventBus = new EventBus();
    }

    @Test
    public void testScreenshotManagerModule() {
        ScreenshotManagerModule mod = new ScreenshotManagerModule();
        assertTrue(mod.isCopyToClipboard());
        assertTrue(mod.isShowNotification());
        assertFalse(mod.isWatermark());
    }

    @Test
    public void testCustomScoreboardModule() {
        CustomScoreboardModule mod = new CustomScoreboardModule();
        assertTrue(mod.isHideRedNumbers());
        assertFalse(mod.isTransparentBackground());
        assertTrue(mod.isTextShadow());
    }

    @Test
    public void testTabListCustomizerModule() {
        TabListCustomizerModule mod = new TabListCustomizerModule();
        assertTrue(mod.isShowNumericPing());
        assertTrue(mod.isShowPlayerHeads());
    }

    @Test
    public void testMemoryWarningModule() {
        MemoryWarningModule mod = new MemoryWarningModule();
        mod.setEnabled(true);
        eventBus.register(mod);

        // Simulate 40 ticks
        for (int i = 1; i <= 40; i++) {
            eventBus.post(new TickEvent(TickEvent.Phase.END, i));
        }

        assertNotNull(mod.getSettingByName("Threshold"));
    }
}
