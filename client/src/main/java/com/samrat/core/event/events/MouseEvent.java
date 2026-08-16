package com.samrat.core.event.events;

import com.samrat.core.event.Cancellable;
import com.samrat.core.event.Event;

public class MouseEvent extends Event implements Cancellable {
    private final int button;
    private final boolean state; // true = pressed, false = released
    private final int dWheel;
    private boolean cancelled = false;

    public MouseEvent(int button, boolean state, int dWheel) {
        this.button = button;
        this.state = state;
        this.dWheel = dWheel;
    }

    public int getButton() {
        return button;
    }

    public boolean isPressed() {
        return state;
    }

    public int getDWheel() {
        return dWheel;
    }

    @Override
    public boolean isCancelled() {
        return cancelled;
    }

    @Override
    public void setCancelled(boolean cancelled) {
        this.cancelled = cancelled;
    }
}
