package com.samrat.core.event.events;

import com.samrat.core.event.Cancellable;
import com.samrat.core.event.Event;

public class ChatEvent extends Event implements Cancellable {
    private String message;
    private final boolean outgoing; // true = sent by player, false = received from server
    private boolean cancelled = false;

    public ChatEvent(String message, boolean outgoing) {
        this.message = message;
        this.outgoing = outgoing;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isOutgoing() {
        return outgoing;
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
