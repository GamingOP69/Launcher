package com.samrat.core.event;

/**
 * Execution priority for event listeners.
 * HIGHEST is executed first, LOWEST is executed last, MONITOR executes after all others to observe final state.
 */
public enum EventPriority {
    HIGHEST(0),
    HIGH(1),
    NORMAL(2),
    LOW(3),
    LOWEST(4),
    MONITOR(5);

    private final int value;

    EventPriority(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
