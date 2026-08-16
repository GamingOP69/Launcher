package com.samrat.core.event.events;

import com.samrat.core.event.Cancellable;
import com.samrat.core.event.Event;

public class PacketEvent extends Event implements Cancellable {
    public enum Direction {
        INCOMING, OUTGOING
    }

    private final Object packet;
    private final Direction direction;
    private boolean cancelled = false;

    public PacketEvent(Object packet, Direction direction) {
        this.packet = packet;
        this.direction = direction;
    }

    public Object getPacket() {
        return packet;
    }

    public Direction getDirection() {
        return direction;
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
