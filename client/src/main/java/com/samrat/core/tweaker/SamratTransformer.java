package com.samrat.core.tweaker;

import com.samrat.SamratClient;
import com.samrat.core.event.events.KeyboardEvent;
import com.samrat.core.event.events.Render2DEvent;
import com.samrat.core.event.events.TickEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Bytecode and runtime hook dispatcher bridging vanilla Minecraft 1.8.9 calls
 * to the SamratClient EventBus.
 */
public class SamratTransformer {
    private static final Logger LOGGER = LoggerFactory.getLogger(SamratTransformer.class);
    private static int tickCounter = 0;

    /**
     * Called at the start of Minecraft.runTick()
     */
    public static void onTickStart() {
        if (!SamratClient.getInstance().isInitialized()) return;
        SamratClient.getInstance().getCore().getEventBus().post(new TickEvent(TickEvent.Phase.START, tickCounter));
    }

    /**
     * Called at the end of Minecraft.runTick()
     */
    public static void onTickEnd() {
        if (!SamratClient.getInstance().isInitialized()) return;
        tickCounter++;
        SamratClient.getInstance().getCore().getEventBus().post(new TickEvent(TickEvent.Phase.END, tickCounter));
    }

    /**
     * Called in EntityRenderer.updateCameraAndRender() or GuiIngame.renderGameOverlay()
     */
    public static void onRender2D(float partialTicks, int screenWidth, int screenHeight) {
        if (!SamratClient.getInstance().isInitialized()) return;
        SamratClient.getInstance().getCore().getEventBus().post(new Render2DEvent(partialTicks, screenWidth, screenHeight));
    }

    /**
     * Called when a keyboard key is pressed/released in Minecraft.runTick()
     */
    public static void onKeyInput(int keyCode, char character, boolean pressed) {
        if (!SamratClient.getInstance().isInitialized()) return;

        // Check if Right Shift was pressed to toggle ClickGUI
        int rightShiftKey = SamratClient.getInstance().getCore().getConfigManager().getRightShiftKey();
        if (pressed && keyCode == rightShiftKey) {
            LOGGER.info("Right Shift pressed! Toggling Samrat Configuration GUI.");
            // Open ClickGUI
        }

        SamratClient.getInstance().getCore().getEventBus().post(new KeyboardEvent(keyCode, character, pressed));
    }
}
