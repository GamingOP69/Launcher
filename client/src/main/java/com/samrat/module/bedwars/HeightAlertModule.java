package com.samrat.module.bedwars;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.NumberSetting;
import com.samrat.render.ColorPalette;
import com.samrat.render.RenderUtils;

public class HeightAlertModule extends Module {
    private final NumberSetting buildLimitWarningY = new NumberSetting("Build Limit Y", "Y height to trigger warning", 110, 80, 150, 1);
    private final NumberSetting voidWarningY = new NumberSetting("Void Warning Y", "Y height to trigger void warning", 20, 0, 50, 1);

    public HeightAlertModule() {
        super("Height Alert", "Alerts when approaching build limit height or void threshold", Category.BEDWARS, 0, true);
        registerSetting(buildLimitWarningY);
        registerSetting(voidWarningY);
    }

    public void checkAndRenderAlert(double currentY, int screenWidth, int screenHeight) {
        if (!isEnabled()) return;

        if (currentY >= buildLimitWarningY.getValue()) {
            String warning = "⚠ APPROACHING BUILD LIMIT (" + (int) currentY + " / " + buildLimitWarningY.getIntValue() + ") ⚠";
            RenderUtils.drawCenteredString(warning, screenWidth / 2.0f, 60, ColorPalette.STATUS_WARNING, true);
        } else if (currentY <= voidWarningY.getValue()) {
            String warning = "☠ VOID WARNING (" + (int) currentY + " / " + voidWarningY.getIntValue() + ") ☠";
            RenderUtils.drawCenteredString(warning, screenWidth / 2.0f, 60, ColorPalette.STATUS_DANGER, true);
        }
    }
}
