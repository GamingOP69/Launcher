package com.samrat.gui;

import com.samrat.core.SamratCore;
import com.samrat.hud.HudElement;
import com.samrat.hud.HudPosition;
import com.samrat.hud.SnapEngine;
import com.samrat.render.ColorPalette;
import com.samrat.render.RenderUtils;

import java.util.ArrayList;
import java.util.List;

public class InteractiveHudEditorScreen {
    private final SamratCore core;

    private HudElement draggingElement = null;
    private float dragOffsetX = 0;
    private float dragOffsetY = 0;

    private List<SnapEngine.SnapLine> currentSnapGuides = new ArrayList<>();

    public InteractiveHudEditorScreen(SamratCore core) {
        this.core = core;
    }

    public void onOpen() {
        core.getHudManager().setInEditorMode(true);
    }

    public void onClose() {
        core.getHudManager().setInEditorMode(false);
        core.getConfigManager().saveConfig();
        draggingElement = null;
    }

    public void render(int mouseX, int mouseY, float partialTicks, int screenWidth, int screenHeight) {
        // Semi-transparent background grid
        RenderUtils.drawRect(0, 0, screenWidth, screenHeight, 0x66000000);

        // Center cross guidelines
        RenderUtils.drawLine(screenWidth / 2.0f, 0, screenWidth / 2.0f, screenHeight, 1.0f, 0x33FFFFFF);
        RenderUtils.drawLine(0, screenHeight / 2.0f, screenWidth, screenHeight / 2.0f, 1.0f, 0x33FFFFFF);

        // Render Active Snap Guides
        for (SnapEngine.SnapLine guide : currentSnapGuides) {
            if (guide.vertical) {
                RenderUtils.drawLine(guide.position, 0, guide.position, screenHeight, 1.5f, ColorPalette.PRIMARY_CYAN);
            } else {
                RenderUtils.drawLine(0, guide.position, screenWidth, guide.position, 1.5f, ColorPalette.PRIMARY_CYAN);
            }
        }

        // Render all HUD elements with selection bounding boxes
        for (HudElement element : core.getHudManager().getElements()) {
            boolean isHovered = element.isHovered(mouseX, mouseY);
            boolean isSelected = (element == draggingElement);

            element.renderEditor(isSelected, partialTicks);

            float x = element.getPosition().getX();
            float y = element.getPosition().getY();
            float w = element.getPosition().getWidth() * element.getPosition().getScale();
            float h = element.getPosition().getHeight() * element.getPosition().getScale();

            int borderColor = isSelected ? ColorPalette.PRIMARY_CYAN : (isHovered ? ColorPalette.SECONDARY_BLUE : 0x44FFFFFF);
            RenderUtils.drawBorder(x - 1, y - 1, x + w + 1, y + h + 1, 1.0f, borderColor);
        }

        // Top instructions toolbar
        RenderUtils.drawRoundedRect((screenWidth - 340) / 2.0f, 12, (screenWidth + 340) / 2.0f, 38, 4, ColorPalette.BG_SURFACE);
        RenderUtils.drawBorder((screenWidth - 340) / 2.0f, 12, (screenWidth + 340) / 2.0f, 38, 1.0f, ColorPalette.BORDER_SUBTLE);
        RenderUtils.drawCenteredString("HUD Layout Editor • Drag to Move • Magnetic Snapping Active", screenWidth / 2.0f, 21, ColorPalette.TEXT_PRIMARY, true);
    }

    public void mouseClicked(int mouseX, int mouseY, int mouseButton, int screenWidth, int screenHeight) {
        if (mouseButton == 0) { // LMB Drag Start
            for (HudElement element : core.getHudManager().getElements()) {
                if (element.isHovered(mouseX, mouseY)) {
                    this.draggingElement = element;
                    this.dragOffsetX = mouseX - element.getPosition().getX();
                    this.dragOffsetY = mouseY - element.getPosition().getY();
                    return;
                }
            }
        }
    }

    public void mouseClickMove(int mouseX, int mouseY, int clickedMouseButton, int screenWidth, int screenHeight) {
        if (draggingElement != null) {
            float rawX = mouseX - dragOffsetX;
            float rawY = mouseY - dragOffsetY;

            draggingElement.getPosition().setX(rawX);
            draggingElement.getPosition().setY(rawY);

            // Compute magnetic snapping
            List<HudPosition> others = new ArrayList<>();
            for (HudElement el : core.getHudManager().getElements()) {
                if (el != draggingElement) {
                    others.add(el.getPosition());
                }
            }

            SnapEngine.SnapResult result = SnapEngine.computeSnap(draggingElement.getPosition(), others, screenWidth, screenHeight);
            draggingElement.getPosition().setX(result.snappedX);
            draggingElement.getPosition().setY(result.snappedY);
            draggingElement.getPosition().clampToBounds(screenWidth, screenHeight);
            this.currentSnapGuides = result.activeGuides;
        }
    }

    public void mouseReleased(int mouseX, int mouseY, int state) {
        this.draggingElement = null;
        this.currentSnapGuides.clear();
        core.getConfigManager().saveConfig();
    }
}
