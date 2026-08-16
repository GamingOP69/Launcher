package com.samrat.core.event;

/**
 * Base class for all Samrat client events.
 */
public abstract class Event {
    private final long timestamp;

    public Event() {
        this.timestamp = System.currentTimeMillis();
    }

    public long getTimestamp() {
        return timestamp;
    }
}
