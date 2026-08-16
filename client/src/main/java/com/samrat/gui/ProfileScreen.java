package com.samrat.gui;

import com.samrat.config.ProfileManager;
import com.samrat.core.SamratCore;
import com.samrat.render.ColorPalette;
import com.samrat.render.RenderUtils;

public class ProfileScreen {
    private final SamratCore core;

    public ProfileScreen(SamratCore core) {
        this.core = core;
    }

    public void render(int mouseX, int mouseY, float partialTicks, int screenWidth, int screenHeight) {
        RenderUtils.drawRect(0, 0, screenWidth, screenHeight, 0xAA000000);

        float panelW = 500;
        float panelH = 340;
        float panelX = (screenWidth - panelW) / 2.0f;
        float panelY = (screenHeight - panelH) / 2.0f;

        RenderUtils.drawRoundedRect(panelX, panelY, panelX + panelW, panelY + panelH, 8, ColorPalette.BG_DARK);
        RenderUtils.drawBorder(panelX, panelY, panelX + panelW, panelY + panelH, 1.5f, ColorPalette.BORDER_SUBTLE);

        RenderUtils.drawString("⚙ SAMRAT PROFILES", panelX + 20, panelY + 20, ColorPalette.PRIMARY_CYAN, true);
        RenderUtils.drawString("Switch, export, and manage configuration presets", panelX + 20, panelY + 34, ColorPalette.TEXT_MUTED, false);

        float listY = panelY + 60;
        for (ProfileManager.ProfileData profile : core.getProfileManager().getProfiles()) {
            boolean isCurrent = profile.name.equalsIgnoreCase(core.getProfileManager().getActiveProfileName());
            boolean isHovered = mouseX >= panelX + 20 && mouseX <= panelX + panelW - 20 && mouseY >= listY && mouseY <= listY + 36;

            int bg = isCurrent ? ColorPalette.BG_SURFACE_ACTIVE : (isHovered ? ColorPalette.BG_SURFACE_HOVER : ColorPalette.BG_SURFACE);
            RenderUtils.drawRoundedRect(panelX + 20, listY, panelX + panelW - 20, listY + 36, 4, bg);
            RenderUtils.drawBorder(panelX + 20, listY, panelX + panelW - 20, listY + 36, 1.0f, isCurrent ? ColorPalette.PRIMARY_CYAN : ColorPalette.BORDER_SUBTLE);

            int nameColor = isCurrent ? ColorPalette.PRIMARY_CYAN : ColorPalette.TEXT_PRIMARY;
            RenderUtils.drawString(profile.name + (profile.isPreset ? " (Built-in)" : ""), panelX + 32, listY + 8, nameColor, isCurrent);
            RenderUtils.drawString(profile.description, panelX + 32, listY + 20, ColorPalette.TEXT_MUTED, false);

            listY += 42;
        }
    }

    public void mouseClicked(int mouseX, int mouseY, int mouseButton, int screenWidth, int screenHeight) {
        float panelW = 500;
        float panelH = 340;
        float panelX = (screenWidth - panelW) / 2.0f;
        float panelY = (screenHeight - panelH) / 2.0f;

        float listY = panelY + 60;
        for (ProfileManager.ProfileData profile : core.getProfileManager().getProfiles()) {
            if (mouseX >= panelX + 20 && mouseX <= panelX + panelW - 20 && mouseY >= listY && mouseY <= listY + 36) {
                core.getProfileManager().applyProfile(profile.name);
                return;
            }
            listY += 42;
        }
    }
}
