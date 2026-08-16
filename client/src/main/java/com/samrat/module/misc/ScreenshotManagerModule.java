package com.samrat.module.misc;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;

public class ScreenshotManagerModule extends Module {
    private final BooleanSetting copyToClipboard = new BooleanSetting("Copy to Clipboard", "Automatically copy captured screenshot to OS clipboard", true);
    private final BooleanSetting showNotification = new BooleanSetting("Notification", "Show interactive on-screen notification on capture", true);
    private final BooleanSetting watermark = new BooleanSetting("Samrat Watermark", "Add small branding watermark to corner of screenshots", false);

    public ScreenshotManagerModule() {
        super("Screenshot Manager", "Enhances screenshot captures with clipboard copying and notifications", Category.MISC, 0, true);
        registerSetting(copyToClipboard);
        registerSetting(showNotification);
        registerSetting(watermark);
    }

    public boolean isCopyToClipboard() {
        return copyToClipboard.getValue();
    }

    public boolean isShowNotification() {
        return showNotification.getValue();
    }

    public boolean isWatermark() {
        return watermark.getValue();
    }
}
