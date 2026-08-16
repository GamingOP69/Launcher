package com.samrat.gui;

import com.samrat.core.SamratCore;
import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.*;
import com.samrat.render.Animation;
import com.samrat.render.ColorPalette;
import com.samrat.render.RenderUtils;

import java.util.List;

/**
 * Modern, futuristic Right Shift configuration GUI.
 * Features categorized navigation, fuzzy search, module cards, keybind assigners, and fluid animations.
 */
public class RightShiftClickGUI {
    private final SamratCore core;

    private Category selectedCategory = Category.HUD;
    private String searchQuery = "";
    private Module expandedModule = null;

    private final Animation categorySlideAnim = new Animation(0.0f, 12.0f);
    private final Animation openAnim = new Animation(0.0f, 15.0f);

    private boolean listeningForKeybind = false;
    private Module keybindTargetModule = null;

    public RightShiftClickGUI(SamratCore core) {
        this.core = core;
    }

    public void onOpen() {
        openAnim.setTarget(1.0f);
        this.searchQuery = "";
        this.expandedModule = null;
        this.listeningForKeybind = false;
    }

    public void onClose() {
        core.getConfigManager().saveConfig();
        this.listeningForKeybind = false;
        this.keybindTargetModule = null;
    }

    public void render(int mouseX, int mouseY, float partialTicks, int screenWidth, int screenHeight) {
        openAnim.update(partialTicks);
        categorySlideAnim.update(partialTicks);

        float animProgress = openAnim.getValue();
        if (animProgress <= 0.05f) return;

        // Dark translucent background overlay
        RenderUtils.drawRect(0, 0, screenWidth, screenHeight, 0x99000000);

        float guiW = 680 * animProgress;
        float guiH = 440 * animProgress;
        float guiX = (screenWidth - guiW) / 2.0f;
        float guiY = (screenHeight - guiH) / 2.0f;

        // Main Window Background & Border
        RenderUtils.drawRoundedRect(guiX, guiY, guiX + guiW, guiY + guiH, 8, ColorPalette.BG_DARK);
        RenderUtils.drawBorder(guiX, guiY, guiX + guiW, guiY + guiH, 1.5f, ColorPalette.BORDER_SUBTLE);

        // Header Bar (Logo, Search & Profile Selector)
        renderHeader(guiX, guiY, guiW, mouseX, mouseY);

        // Left Sidebar: Categories Navigation
        renderSidebar(guiX, guiY + 50, 160, guiH - 50, mouseX, mouseY);

        // Right Content Area: Module Cards & Settings
        renderContentArea(guiX + 165, guiY + 50, guiW - 170, guiH - 55, mouseX, mouseY);
    }

    private void renderHeader(float x, float y, float w, int mouseX, int mouseY) {
        // Logo & Title
        RenderUtils.drawString("⚡ SAMRAT CLIENT", x + 16, y + 18, ColorPalette.PRIMARY_CYAN, true);
        RenderUtils.drawString("v1.0.0", x + 125, y + 19, ColorPalette.TEXT_MUTED, false);

        // Search Bar Container
        float searchX = x + 200;
        float searchY = y + 12;
        float searchW = 240;
        float searchH = 26;
        RenderUtils.drawRoundedRect(searchX, searchY, searchX + searchW, searchY + searchH, 4, ColorPalette.BG_SURFACE);
        RenderUtils.drawBorder(searchX, searchY, searchX + searchW, searchY + searchH, 1.0f, ColorPalette.BORDER_SUBTLE);

        String searchDisplay = searchQuery.isEmpty() ? "🔍 Search modules..." : searchQuery;
        int searchTextColor = searchQuery.isEmpty() ? ColorPalette.TEXT_MUTED : ColorPalette.TEXT_PRIMARY;
        RenderUtils.drawString(searchDisplay, searchX + 8, searchY + 8, searchTextColor, false);

        // Active Profile Indicator
        String profileText = "Profile: " + core.getProfileManager().getActiveProfileName();
        RenderUtils.drawString(profileText, x + w - 160, y + 18, ColorPalette.TEXT_SECONDARY, false);
    }

    private void renderSidebar(float x, float y, float w, float h, int mouseX, int mouseY) {
        RenderUtils.drawRoundedRect(x + 8, y, x + w, y + h, 6, ColorPalette.BG_SURFACE);

        float tabY = y + 10;
        for (Category category : Category.values()) {
            boolean isSelected = category == selectedCategory;
            boolean isHovered = mouseX >= x + 12 && mouseX <= x + w - 4 && mouseY >= tabY && mouseY <= tabY + 30;

            int tabBg = isSelected ? ColorPalette.BG_SURFACE_ACTIVE : (isHovered ? ColorPalette.BG_SURFACE_HOVER : 0);
            if (tabBg != 0) {
                RenderUtils.drawRoundedRect(x + 12, tabY, x + w - 4, tabY + 30, 4, tabBg);
            }

            if (isSelected) {
                // Active cyan tab pill indicator
                RenderUtils.drawRect(x + 12, tabY + 4, x + 15, tabY + 26, ColorPalette.PRIMARY_CYAN);
            }

            int textColor = isSelected ? ColorPalette.PRIMARY_CYAN : (isHovered ? ColorPalette.TEXT_PRIMARY : ColorPalette.TEXT_SECONDARY);
            RenderUtils.drawString(category.getDisplayName(), x + 24, tabY + 10, textColor, isSelected);

            tabY += 34;
        }
    }

    private void renderContentArea(float x, float y, float w, float h, int mouseX, int mouseY) {
        List<Module> visibleModules = searchQuery.isEmpty()
                ? core.getModuleManager().getModulesByCategory(selectedCategory)
                : core.getModuleManager().searchModules(searchQuery);

        float cardY = y + 8;
        for (Module module : visibleModules) {
            renderModuleCard(module, x, cardY, w, mouseX, mouseY);
            cardY += (expandedModule == module ? 110 : 44);
        }
    }

    private void renderModuleCard(Module module, float x, float y, float w, int mouseX, int mouseY) {
        boolean isHovered = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + 38;
        int cardBg = isHovered ? ColorPalette.BG_SURFACE_HOVER : ColorPalette.BG_SURFACE;

        float cardHeight = (expandedModule == module ? 100 : 38);
        RenderUtils.drawRoundedRect(x, y, x + w, y + cardHeight, 6, cardBg);
        RenderUtils.drawBorder(x, y, x + w, y + cardHeight, 1.0f, module.isEnabled() ? ColorPalette.PRIMARY_CYAN_TRANSLUCENT : ColorPalette.BORDER_SUBTLE);

        // Module Name & Description
        int nameColor = module.isEnabled() ? ColorPalette.PRIMARY_CYAN : ColorPalette.TEXT_PRIMARY;
        RenderUtils.drawString(module.getName(), x + 12, y + 10, nameColor, module.isEnabled());
        RenderUtils.drawString(module.getDescription(), x + 12, y + 22, ColorPalette.TEXT_MUTED, false);

        // Keybind Button
        String keyText = (listeningForKeybind && keybindTargetModule == module) ? "Press Key..." : "[" + module.getKeybind().getKeyName() + "]";
        RenderUtils.drawString(keyText, x + w - 120, y + 14, ColorPalette.TEXT_SECONDARY, false);

        // Enable / Disable Toggle Switch
        float toggleX = x + w - 48;
        float toggleY = y + 10;
        int toggleBg = module.isEnabled() ? ColorPalette.PRIMARY_CYAN : ColorPalette.BG_DARK;
        RenderUtils.drawRoundedRect(toggleX, toggleY, toggleX + 36, toggleY + 18, 9, toggleBg);

        float circleX = module.isEnabled() ? (toggleX + 20) : (toggleX + 2);
        RenderUtils.drawRoundedRect(circleX, toggleY + 2, circleX + 14, toggleY + 16, 7, ColorPalette.TEXT_PRIMARY);

        // Expanded Settings Area
        if (expandedModule == module) {
            renderExpandedSettings(module, x + 12, y + 42, w - 24);
        }
    }

    private void renderExpandedSettings(Module module, float x, float y, float w) {
        RenderUtils.drawRect(x, y, x + w, y + 1, ColorPalette.BORDER_SUBTLE);
        float sY = y + 8;
        for (Setting<?> setting : module.getSettings()) {
            if (setting instanceof KeybindSetting) continue;
            RenderUtils.drawString(setting.getName() + ": " + setting.getSerializedValue(), x + 4, sY, ColorPalette.TEXT_SECONDARY, false);
            sY += 14;
        }
    }

    public void mouseClicked(int mouseX, int mouseY, int mouseButton, int screenWidth, int screenHeight) {
        float guiW = 680;
        float guiH = 440;
        float guiX = (screenWidth - guiW) / 2.0f;
        float guiY = (screenHeight - guiH) / 2.0f;

        // Check Category clicks
        float tabY = guiY + 60;
        for (Category category : Category.values()) {
            if (mouseX >= guiX + 12 && mouseX <= guiX + 156 && mouseY >= tabY && mouseY <= tabY + 30) {
                this.selectedCategory = category;
                this.expandedModule = null;
                return;
            }
            tabY += 34;
        }

        // Check Module clicks
        float contentX = guiX + 165;
        float contentY = guiY + 58;
        float contentW = guiW - 170;

        List<Module> visibleModules = searchQuery.isEmpty()
                ? core.getModuleManager().getModulesByCategory(selectedCategory)
                : core.getModuleManager().searchModules(searchQuery);

        for (Module module : visibleModules) {
            float cardH = (expandedModule == module ? 100 : 38);

            // Toggle switch clicked
            float toggleX = contentX + contentW - 48;
            if (mouseX >= toggleX && mouseX <= toggleX + 36 && mouseY >= contentY + 10 && mouseY <= contentY + 28) {
                module.toggle();
                core.getConfigManager().saveConfig();
                return;
            }

            // Keybind button clicked
            float keyX = contentX + contentW - 120;
            if (mouseX >= keyX && mouseX <= keyX + 60 && mouseY >= contentY + 10 && mouseY <= contentY + 26) {
                this.listeningForKeybind = true;
                this.keybindTargetModule = module;
                return;
            }

            // Expand/Collapse settings on card right-click or middle-click
            if (mouseX >= contentX && mouseX <= contentX + contentW && mouseY >= contentY && mouseY <= contentY + 38) {
                if (mouseButton == 1) { // RMB expands
                    this.expandedModule = (this.expandedModule == module ? null : module);
                    return;
                }
            }

            contentY += (expandedModule == module ? 110 : 44);
        }
    }

    public void keyTyped(char typedChar, int keyCode) {
        if (listeningForKeybind && keybindTargetModule != null) {
            if (keyCode == 1) { // ESC clears keybind
                keybindTargetModule.getKeybind().setValue(KeybindSetting.KEY_NONE);
            } else {
                keybindTargetModule.getKeybind().setValue(keyCode);
            }
            this.listeningForKeybind = false;
            this.keybindTargetModule = null;
            core.getConfigManager().saveConfig();
            return;
        }

        if (keyCode == 14) { // Backspace
            if (!searchQuery.isEmpty()) {
                searchQuery = searchQuery.substring(0, searchQuery.length() - 1);
            }
        } else if (Character.isLetterOrDigit(typedChar) || typedChar == ' ') {
            if (searchQuery.length() < 30) {
                searchQuery += typedChar;
            }
        }
    }

    public Category getSelectedCategory() {
        return selectedCategory;
    }

    public void setSelectedCategory(Category selectedCategory) {
        this.selectedCategory = selectedCategory;
    }
}
