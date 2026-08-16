package com.samrat.gui;

import com.samrat.core.SamratCore;
import com.samrat.performance.BenchmarkEngine;
import com.samrat.performance.PerformancePreset;
import com.samrat.render.ColorPalette;
import com.samrat.render.RenderUtils;

public class PerformanceLabScreen {
    private final SamratCore core;
    private BenchmarkEngine.BenchmarkResult latestResult;

    public PerformanceLabScreen(SamratCore core) {
        this.core = core;
    }

    public void render(int mouseX, int mouseY, float partialTicks, int screenWidth, int screenHeight) {
        RenderUtils.drawRect(0, 0, screenWidth, screenHeight, 0xAA000000);

        float panelW = 560;
        float panelH = 380;
        float panelX = (screenWidth - panelW) / 2.0f;
        float panelY = (screenHeight - panelH) / 2.0f;

        RenderUtils.drawRoundedRect(panelX, panelY, panelX + panelW, panelY + panelH, 8, ColorPalette.BG_DARK);
        RenderUtils.drawBorder(panelX, panelY, panelX + panelW, panelY + panelH, 1.5f, ColorPalette.BORDER_SUBTLE);

        // Header
        RenderUtils.drawString("⚡ SAMRAT PERFORMANCE LAB", panelX + 20, panelY + 20, ColorPalette.PRIMARY_CYAN, true);
        RenderUtils.drawString("Hardware Benchmark & Frametime Analysis", panelX + 20, panelY + 34, ColorPalette.TEXT_MUTED, false);

        BenchmarkEngine engine = core.getPerformanceManager().getBenchmarkEngine();

        // Status Card
        float cardY = panelY + 60;
        RenderUtils.drawRoundedRect(panelX + 20, cardY, panelX + panelW - 20, cardY + 120, 6, ColorPalette.BG_SURFACE);

        if (engine.isRunning()) {
            RenderUtils.drawCenteredString("⚡ BENCHMARK RUNNING (" + engine.getRecordedFrames() + " frames recorded) ⚡", panelX + (panelW / 2.0f), cardY + 50, ColorPalette.STATUS_WARNING, true);
        } else if (latestResult != null) {
            RenderUtils.drawString(String.format("Average FPS: %.1f", latestResult.averageFps), panelX + 35, cardY + 20, ColorPalette.TEXT_PRIMARY, true);
            RenderUtils.drawString(String.format("1%% Low FPS: %.1f", latestResult.onePercentLowFps), panelX + 35, cardY + 40, ColorPalette.PRIMARY_CYAN, true);
            RenderUtils.drawString(String.format("0.1%% Low FPS: %.1f", latestResult.zeroPointOnePercentLowFps), panelX + 35, cardY + 60, ColorPalette.ACCENT_SILVER, false);
            RenderUtils.drawString(String.format("Avg Frametime: %.2f ms", latestResult.averageFrameTimeMs), panelX + 260, cardY + 20, ColorPalette.TEXT_SECONDARY, false);
            RenderUtils.drawString(String.format("Memory: %d / %d MB", latestResult.usedMemoryMb, latestResult.maxMemoryMb), panelX + 260, cardY + 40, ColorPalette.TEXT_SECONDARY, false);
            RenderUtils.drawString("Score: " + latestResult.score + " pts", panelX + 260, cardY + 60, ColorPalette.STATUS_SUCCESS, true);
        } else {
            RenderUtils.drawCenteredString("Press 'Start 10s Benchmark' below to run automated profiling", panelX + (panelW / 2.0f), cardY + 50, ColorPalette.TEXT_MUTED, false);
        }

        // Action Buttons (Start Benchmark / Defrag Memory)
        float btnY = panelY + 195;
        drawButton("Start 10s Benchmark", panelX + 20, btnY, 180, 28, ColorPalette.PRIMARY_CYAN, mouseX, mouseY);
        drawButton("Defragment Memory", panelX + 210, btnY, 160, 28, ColorPalette.SECONDARY_BLUE, mouseX, mouseY);

        // Performance Preset Selector
        float presetY = panelY + 240;
        RenderUtils.drawString("Active Performance Preset:", panelX + 20, presetY, ColorPalette.TEXT_PRIMARY, true);
        float pX = panelX + 20;
        for (PerformancePreset preset : PerformancePreset.values()) {
            boolean isCurrent = (core.getPerformanceManager().getActivePreset() == preset);
            int bg = isCurrent ? ColorPalette.PRIMARY_CYAN : ColorPalette.BG_SURFACE;
            int textCol = isCurrent ? ColorPalette.BG_DARK : ColorPalette.TEXT_PRIMARY;
            RenderUtils.drawRoundedRect(pX, presetY + 16, pX + 96, presetY + 42, 4, bg);
            RenderUtils.drawCenteredString(preset.getDisplayName(), pX + 48, presetY + 24, textCol, isCurrent);
            pX += 104;
        }
    }

    private void drawButton(String label, float x, float y, float w, float h, int color, int mouseX, int mouseY) {
        boolean isHovered = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
        RenderUtils.drawRoundedRect(x, y, x + w, y + h, 4, isHovered ? ColorPalette.BG_SURFACE_HOVER : ColorPalette.BG_SURFACE);
        RenderUtils.drawBorder(x, y, x + w, y + h, 1.0f, color);
        RenderUtils.drawCenteredString(label, x + (w / 2.0f), y + (h / 2.0f) - 4, color, isHovered);
    }

    public void mouseClicked(int mouseX, int mouseY, int mouseButton, int screenWidth, int screenHeight) {
        float panelW = 560;
        float panelH = 380;
        float panelX = (screenWidth - panelW) / 2.0f;
        float panelY = (screenHeight - panelH) / 2.0f;

        // Start Benchmark button
        float btnY = panelY + 195;
        if (mouseX >= panelX + 20 && mouseX <= panelX + 200 && mouseY >= btnY && mouseY <= btnY + 28) {
            core.getPerformanceManager().getBenchmarkEngine().startBenchmark(10);
            return;
        }

        // Defragment Memory button
        if (mouseX >= panelX + 210 && mouseX <= panelX + 370 && mouseY >= btnY && mouseY <= btnY + 28) {
            core.getPerformanceManager().defragmentMemory();
            return;
        }

        // Preset buttons
        float presetY = panelY + 240;
        float pX = panelX + 20;
        for (PerformancePreset preset : PerformancePreset.values()) {
            if (mouseX >= pX && mouseX <= pX + 96 && mouseY >= presetY + 16 && mouseY <= presetY + 42) {
                core.getPerformanceManager().applyPreset(preset);
                return;
            }
            pX += 104;
        }
    }

    public void setLatestResult(BenchmarkEngine.BenchmarkResult latestResult) {
        this.latestResult = latestResult;
    }
}
