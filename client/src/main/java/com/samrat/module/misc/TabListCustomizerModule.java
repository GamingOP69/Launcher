package com.samrat.module.misc;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;

public class TabListCustomizerModule extends Module {
    private final BooleanSetting showNumericPing = new BooleanSetting("Numeric Ping", "Displays exact ping ms in tab list instead of green bars", true);
    private final BooleanSetting showPlayerHeads = new BooleanSetting("Player Heads", "Displays player skin head icons in tab list", true);

    public TabListCustomizerModule() {
        super("Tab List", "Customizes tab list layout with exact ping numbers and head avatars", Category.MISC, 0, true);
        registerSetting(showNumericPing);
        registerSetting(showPlayerHeads);
    }

    public boolean isShowNumericPing() {
        return showNumericPing.getValue();
    }

    public boolean isShowPlayerHeads() {
        return showPlayerHeads.getValue();
    }
}
