# Samrat Event System

## Overview

The Samrat Event System is a decoupled, ultra-fast publish-subscribe bus engineered specifically for 60+ FPS and 144+ FPS rendering loops without causing garbage collector pauses.

## Event Hierarchy

- **`Event`**: Base class containing a timestamp.
  - `ClientInitEvent` / `ClientShutdownEvent`
  - `TickEvent` (Phase: START, END)
  - `Render2DEvent` (partialTicks, screenWidth, screenHeight)
  - `Render3DEvent` (partialTicks)
  - `KeyboardEvent` (keyCode, character, state) — *Cancellable*
  - `MouseEvent` (button, state, dWheel) — *Cancellable*
  - `ScreenOpenEvent` / `ScreenCloseEvent` — *Cancellable*
  - `WorldEvent` (Type: LOAD, UNLOAD)
  - `ChatEvent` (message, outgoing) — *Cancellable*
  - `AttackEntityEvent` (target, distance)

## Priorities

```java
public enum EventPriority {
    HIGHEST(0),
    HIGH(1),
    NORMAL(2),
    LOW(3),
    LOWEST(4),
    MONITOR(5);
}
```

## Subscribing to Events

```java
public class MyCustomModule extends Module {
    public MyCustomModule() {
        super("Custom Module", "Example listener", Category.MISC);
    }

    @EventListener(priority = EventPriority.HIGH)
    public void onTick(TickEvent event) {
        if (event.getPhase() == TickEvent.Phase.END) {
            // High priority logic
        }
    }
}
```
