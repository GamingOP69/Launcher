package com.samrat.core.event.events;

import com.samrat.core.event.Event;

public class AttackEntityEvent extends Event {
    private final Object targetEntity;
    private final double distance;

    public AttackEntityEvent(Object targetEntity, double distance) {
        this.targetEntity = targetEntity;
        this.distance = distance;
    }

    public Object getTargetEntity() {
        return targetEntity;
    }

    public double getDistance() {
        return distance;
    }
}
