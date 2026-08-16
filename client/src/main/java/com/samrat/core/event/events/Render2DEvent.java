package com.samrat.core.event.events;

import com.samrat.core.event.Event;

public class Render2DEvent extends Event {
    private final float partialTicks;
    private final int screenWidth;
    private final int screenHeight;

    public Render2DEvent(float partialTicks, int screenWidth, int screenHeight) {
        this.partialTicks = partialTicks;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
    }

    public float getPartialTicks() {
        return partialTicks;
    }

    public int getScreenWidth() {
        return screenWidth;
    }

    public int getScreenHeight() {
        return screenHeight;
    }
}
