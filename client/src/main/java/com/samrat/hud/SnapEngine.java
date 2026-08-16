package com.samrat.hud;

import java.util.ArrayList;
import java.util.List;

/**
 * SnapEngine handles magnetic snapping to screen edges, center lines, and neighboring HUD elements.
 */
public final class SnapEngine {
    public static final float SNAP_DISTANCE = 8.0f;

    public static final class SnapResult {
        public final float snappedX;
        public final float snappedY;
        public final List<SnapLine> activeGuides;

        public SnapResult(float snappedX, float snappedY, List<SnapLine> activeGuides) {
            this.snappedX = snappedX;
            this.snappedY = snappedY;
            this.activeGuides = activeGuides;
        }
    }

    public static final class SnapLine {
        public final boolean vertical;
        public final float position;

        public SnapLine(boolean vertical, float position) {
            this.vertical = vertical;
            this.position = position;
        }
    }

    public static SnapResult computeSnap(HudPosition target, List<HudPosition> others, int screenWidth, int screenHeight) {
        float x = target.getX();
        float y = target.getY();
        float w = target.getWidth() * target.getScale();
        float h = target.getHeight() * target.getScale();

        List<SnapLine> guides = new ArrayList<>();

        // Screen Snap Targets (X)
        float leftEdge = 4.0f;
        float centerX = (screenWidth - w) / 2.0f;
        float rightEdge = screenWidth - w - 4.0f;

        if (Math.abs(x - leftEdge) <= SNAP_DISTANCE) {
            x = leftEdge;
            guides.add(new SnapLine(true, leftEdge));
        } else if (Math.abs(x - centerX) <= SNAP_DISTANCE) {
            x = centerX;
            guides.add(new SnapLine(true, screenWidth / 2.0f));
        } else if (Math.abs(x - rightEdge) <= SNAP_DISTANCE) {
            x = rightEdge;
            guides.add(new SnapLine(true, screenWidth - 4.0f));
        }

        // Screen Snap Targets (Y)
        float topEdge = 4.0f;
        float centerY = (screenHeight - h) / 2.0f;
        float bottomEdge = screenHeight - h - 4.0f;

        if (Math.abs(y - topEdge) <= SNAP_DISTANCE) {
            y = topEdge;
            guides.add(new SnapLine(false, topEdge));
        } else if (Math.abs(y - centerY) <= SNAP_DISTANCE) {
            y = centerY;
            guides.add(new SnapLine(false, screenHeight / 2.0f));
        } else if (Math.abs(y - bottomEdge) <= SNAP_DISTANCE) {
            y = bottomEdge;
            guides.add(new SnapLine(false, screenHeight - 4.0f));
        }

        // Snap to other elements
        for (HudPosition other : others) {
            if (other == target) continue;
            float otherX = other.getX();
            float otherY = other.getY();
            float otherW = other.getWidth() * other.getScale();
            float otherH = other.getHeight() * other.getScale();

            // Vertical alignment (align lefts or rights)
            if (Math.abs(x - otherX) <= SNAP_DISTANCE) {
                x = otherX;
                guides.add(new SnapLine(true, otherX));
            } else if (Math.abs(x - (otherX + otherW + 4.0f)) <= SNAP_DISTANCE) {
                x = otherX + otherW + 4.0f;
                guides.add(new SnapLine(true, x));
            }

            // Horizontal alignment (align tops or bottoms)
            if (Math.abs(y - otherY) <= SNAP_DISTANCE) {
                y = otherY;
                guides.add(new SnapLine(false, otherY));
            } else if (Math.abs(y - (otherY + otherH + 4.0f)) <= SNAP_DISTANCE) {
                y = otherY + otherH + 4.0f;
                guides.add(new SnapLine(false, y));
            }
        }

        return new SnapResult(x, y, guides);
    }
}
