package com.samrat.core.event.events;

import com.samrat.core.event.Cancellable;
import com.samrat.core.event.Event;

public class KeyboardEvent extends Event implements Cancellable {
    private final int keyCode;
    private final char character;
    private final boolean state; // true = pressed, false = released
    private boolean cancelled = false;

    public KeyboardEvent(int keyCode, char character, boolean state) {
        this.keyCode = keyCode;
        this.character = character;
        this.state = state;
    }

    public int getKeyCode() {
        return keyCode;
    }

    public char getCharacter() {
        return character;
    }

    public boolean isPressed() {
        return state;
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
