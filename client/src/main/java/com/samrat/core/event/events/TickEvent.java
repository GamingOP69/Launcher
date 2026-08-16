package com.samrat.core.event.events;

import com.samrat.core.event.Event;

public class TickEvent extends Event {
    public enum Phase {
        START, END
    }

    private final Phase phase;
    private final int tickCount;

    public TickEvent(Phase phase, int tickCount) {
        this.phase = phase;
        this.tickCount = tickCount;
    }

    public Phase getPhase() {
        return phase;
    }

    public int getTickCount() {
        return tickCount;
    }
}
