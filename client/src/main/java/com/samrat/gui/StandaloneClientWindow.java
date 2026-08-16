package com.samrat.gui;

import com.samrat.SamratClient;
import com.samrat.core.SamratCore;
import com.samrat.core.module.Module;
import com.samrat.performance.FastMath;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

/**
 * Standalone graphical window for the Samrat Client.
 * Provides interactive HUD rendering, real-time keystroke tracking, CPS measurement,
 * OptiFine Zoom (C key), and Right-Shift ClickGUI module configuration.
 */
public class StandaloneClientWindow extends JFrame {
    private static final Logger LOGGER = LoggerFactory.getLogger(StandaloneClientWindow.class);

    private final SamratCore core;
    private final String username;
    private final String profileName;

    private int fps = 144;
    private int lmbCps = 0;
    private int rmbCps = 0;
    private int comboCount = 0;
    private float zoomScale = 1.0f;
    private final LinkedList<Long> lmbClicks = new LinkedList<>();
    private final LinkedList<Long> rmbClicks = new LinkedList<>();

    private final Map<Integer, Boolean> keyStates = new HashMap<>();
    private boolean showClickGui = false;
    private boolean showHud = true;
    private final GameCanvas canvas;

    public StandaloneClientWindow(SamratCore core, String username, String profileName, int width, int height) {
        this.core = core;
        this.username = (username == null || username.trim().isEmpty()) ? "SamratPlayer" : username.trim();
        this.profileName = (profileName == null || profileName.trim().isEmpty()) ? "Default" : profileName.trim();

        setTitle("Samrat Client 1.8.9 — [User: " + this.username + " | Profile: " + this.profileName + "]");
        setSize(Math.max(900, width), Math.max(650, height));
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
        setBackground(new Color(12, 16, 23));

        // Add window close listener to trigger graceful shutdown
        addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
                LOGGER.info("Client window closing requested by user.");
                dispose();
                SamratClient.getInstance().shutdown();
                System.exit(0);
            }
        });

        canvas = new GameCanvas();
        canvas.setFocusable(true);

        // Key Listener for WASD, Space, Right-Shift, F3, C (Zoom)
        KeyAdapter keyAdapter = new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                keyStates.put(e.getKeyCode(), true);
                if (e.getKeyCode() == KeyEvent.VK_SHIFT && e.getKeyLocation() == KeyEvent.KEY_LOCATION_RIGHT) {
                    showClickGui = !showClickGui;
                    LOGGER.info("Right-Shift ClickGUI toggled: {}", showClickGui ? "OPEN" : "CLOSED");
                } else if (e.getKeyCode() == KeyEvent.VK_F3) {
                    showHud = !showHud;
                } else if (e.getKeyCode() == KeyEvent.VK_B) {
                    runBenchmark();
                }
                canvas.repaint();
            }

            @Override
            public void keyReleased(KeyEvent e) {
                keyStates.put(e.getKeyCode(), false);
                canvas.repaint();
            }
        };

        this.addKeyListener(keyAdapter);
        canvas.addKeyListener(keyAdapter);

        // Mouse Listener for CPS calculation & ClickGUI interaction
        canvas.addMouseListener(new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                canvas.requestFocusInWindow();
                long now = System.currentTimeMillis();

                if (showClickGui) {
                    handleClickGuiClick(e.getX(), e.getY());
                    canvas.repaint();
                    return;
                }

                if (SwingUtilities.isLeftMouseButton(e)) {
                    lmbClicks.add(now);
                    keyStates.put(MouseEvent.BUTTON1, true);
                    comboCount++;
                } else if (SwingUtilities.isRightMouseButton(e)) {
                    rmbClicks.add(now);
                    keyStates.put(MouseEvent.BUTTON3, true);
                }
                updateCps();
                canvas.repaint();
            }

            @Override
            public void mouseReleased(MouseEvent e) {
                if (SwingUtilities.isLeftMouseButton(e)) {
                    keyStates.put(MouseEvent.BUTTON1, false);
                } else if (SwingUtilities.isRightMouseButton(e)) {
                    keyStates.put(MouseEvent.BUTTON3, false);
                }
                canvas.repaint();
            }
        });

        setContentPane(canvas);

        // Rendering & tick loop timer (60 FPS refresh)
        Timer renderTimer = new Timer(16, e -> {
            updateCps();
            boolean isC = keyStates.getOrDefault(KeyEvent.VK_C, false);
            float targetZoom = (isC && isModuleEnabled("OptiFine Zoom")) ? 2.5f : 1.0f;
            zoomScale += (targetZoom - zoomScale) * 0.2f;
            canvas.repaint();
        });
        renderTimer.start();
    }

    private boolean isModuleEnabled(String name) {
        if (core == null || core.getModuleManager() == null) return true;
        Module m = core.getModuleManager().getModuleByName(name);
        return m != null && m.isEnabled();
    }

    private void handleClickGuiClick(int mouseX, int mouseY) {
        int w = canvas.getWidth();
        int h = canvas.getHeight();
        int guiW = 620;
        int guiH = 400;
        int guiX = (w - guiW) / 2;
        int guiY = (h - guiH) / 2;

        int col = 0;
        int row = 0;
        for (Module mod : core.getModuleManager().getModules()) {
            int mX = guiX + 24 + col * 190;
            int mY = guiY + 76 + row * 44;
            int mW = 180;
            int mH = 36;

            if (mouseX >= mX && mouseX <= mX + mW && mouseY >= mY && mouseY <= mY + mH) {
                mod.toggle();
                core.getConfigManager().saveConfig();
                LOGGER.info("Module {} toggled via ClickGUI: {}", mod.getName(), mod.isEnabled() ? "ON" : "OFF");
                break;
            }

            col++;
            if (col >= 3) {
                col = 0;
                row++;
            }
            if (row >= 6) break;
        }
    }

    private void updateCps() {
        long cutoff = System.currentTimeMillis() - 1000;
        while (!lmbClicks.isEmpty() && lmbClicks.peekFirst() < cutoff) {
            lmbClicks.pollFirst();
        }
        while (!rmbClicks.isEmpty() && rmbClicks.peekFirst() < cutoff) {
            rmbClicks.pollFirst();
        }
        lmbCps = lmbClicks.size();
        rmbCps = rmbClicks.size();
    }

    private void runBenchmark() {
        long start = System.nanoTime();
        double sum = 0;
        for (int i = 0; i < 100_000; i++) {
            sum += FastMath.sin(i * 0.01f);
        }
        long durationMs = (System.nanoTime() - start) / 1_000_000;
        LOGGER.info("[PERFORMANCE_LAB] FastMath 100,000 Trig Operations executed in {}ms (Result: {})", durationMs, sum);
    }

    private class GameCanvas extends JPanel {
        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            Graphics2D g2 = (Graphics2D) g;
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

            int w = getWidth();
            int h = getHeight();

            // 1. Clean Dark Esports Background
            GradientPaint bg = new GradientPaint(0, 0, new Color(13, 17, 26), 0, h, new Color(7, 10, 16));
            g2.setPaint(bg);
            g2.fillRect(0, 0, w, h);

            // 2. Top Header Bar
            g2.setColor(new Color(19, 25, 38, 240));
            g2.fillRect(0, 0, w, 44);
            g2.setColor(new Color(35, 48, 70));
            g2.drawLine(0, 44, w, 44);

            g2.setFont(new Font("Segoe UI", Font.BOLD, 14));
            g2.setColor(new Color(6, 182, 212));
            g2.drawString("SAMRAT CLIENT 1.8.9", 18, 27);

            g2.setFont(new Font("Segoe UI", Font.PLAIN, 12));
            g2.setColor(new Color(156, 163, 175));
            g2.drawString("•  Player: " + username + "  •  Profile: " + profileName + "  •  [C] Zoom  •  [RIGHT-SHIFT] ClickGUI  •  [F3] Toggle HUD", 190, 27);

            // 3. Zoom Magnification Overlay
            if (zoomScale > 1.05f) {
                g2.setColor(new Color(6, 182, 212, 40));
                g2.fillOval(w / 2 - 120, h / 2 - 120, 240, 240);
                g2.setColor(new Color(6, 182, 212, 120));
                g2.drawOval(w / 2 - 120, h / 2 - 120, 240, 240);
                g2.setFont(new Font("Segoe UI", Font.BOLD, 11));
                g2.drawString("ZOOM " + String.format("%.1fx", zoomScale), w / 2 - 26, h / 2 + 140);
            }

            // 4. Render Custom Crosshair in Center
            if (isModuleEnabled("Custom Crosshair")) {
                int cX = w / 2;
                int cY = h / 2;
                g2.setColor(new Color(6, 182, 212, 220));
                g2.setStroke(new BasicStroke(2.0f));
                g2.drawLine(cX - 8, cY, cX - 3, cY);
                g2.drawLine(cX + 3, cY, cX + 8, cY);
                g2.drawLine(cX, cY - 8, cX, cY - 3);
                g2.drawLine(cX, cY + 3, cX, cY + 8);
                g2.fillRect(cX - 1, cY - 1, 2, 2);
            }

            // 5. Render HUD Elements
            if (showHud) {
                renderHudOverlay(g2, w, h);
            }

            // 6. Render ClickGUI if open
            if (showClickGui) {
                renderClickGuiOverlay(g2, w, h);
            }
        }

        private void renderHudOverlay(Graphics2D g2, int w, int h) {
            int currentLeftY = 58;

            // FPS & Ping Box (Top Left)
            if (isModuleEnabled("FPS Display")) {
                drawGlassBox(g2, 18, currentLeftY, 140, 52);
                g2.setColor(new Color(34, 197, 94));
                g2.setFont(new Font("Segoe UI", Font.BOLD, 16));
                g2.drawString(fps + " FPS", 28, currentLeftY + 24);
                g2.setColor(new Color(6, 182, 212));
                g2.setFont(new Font("Segoe UI", Font.PLAIN, 12));
                g2.drawString("Ping: 24ms  •  1.8.9", 28, currentLeftY + 42);
                currentLeftY += 58;
            }

            // CPS Box (Top Left below FPS)
            if (isModuleEnabled("CPS Display")) {
                drawGlassBox(g2, 18, currentLeftY, 140, 52);
                g2.setColor(Color.WHITE);
                g2.setFont(new Font("Segoe UI", Font.BOLD, 14));
                g2.drawString("CPS: " + lmbCps + " | " + rmbCps, 28, currentLeftY + 24);
                g2.setColor(new Color(156, 163, 175));
                g2.setFont(new Font("Segoe UI", Font.PLAIN, 11));
                g2.drawString("LMB: " + lmbCps + "  •  RMB: " + rmbCps, 28, currentLeftY + 40);
                currentLeftY += 58;
            }

            // Combo Counter (Top Left below CPS)
            if (isModuleEnabled("Combo Counter")) {
                drawGlassBox(g2, 18, currentLeftY, 140, 36);
                g2.setColor(new Color(234, 179, 8));
                g2.setFont(new Font("Segoe UI", Font.BOLD, 13));
                g2.drawString("Combo: " + comboCount + " Hits", 28, currentLeftY + 23);
                currentLeftY += 42;
            }

            // Armor Status (Top Left below Combo)
            if (isModuleEnabled("Armor Status")) {
                drawGlassBox(g2, 18, currentLeftY, 140, 68);
                g2.setFont(new Font("Segoe UI", Font.BOLD, 10));
                g2.setColor(new Color(6, 182, 212));
                g2.drawString("ARMOR DURABILITY", 26, currentLeftY + 16);
                g2.setFont(new Font("Segoe UI", Font.PLAIN, 10));
                g2.setColor(new Color(34, 197, 94));
                g2.drawString("• Diamond Helmet: 98%", 26, currentLeftY + 29);
                g2.drawString("• Diamond Chest: 94%", 26, currentLeftY + 41);
                g2.drawString("• Diamond Legs: 96%", 26, currentLeftY + 53);
                g2.drawString("• Diamond Boots: 92%", 26, currentLeftY + 65);
                currentLeftY += 74;
            }

            // Potion Status (Top Left below Armor)
            if (isModuleEnabled("Potion Status")) {
                drawGlassBox(g2, 18, currentLeftY, 140, 42);
                g2.setFont(new Font("Segoe UI", Font.BOLD, 11));
                g2.setColor(new Color(59, 130, 246));
                g2.drawString("Speed II (04:12)", 26, currentLeftY + 18);
                g2.setColor(new Color(239, 68, 68));
                g2.drawString("Strength I (01:45)", 26, currentLeftY + 34);
            }

            // Keystrokes Box (Right Center)
            if (isModuleEnabled("Keystrokes")) {
                int kX = w - 160;
                int kY = 60;
                drawKeystroke(g2, kX + 44, kY, 40, 40, "W", isKeyPressed(KeyEvent.VK_W));
                drawKeystroke(g2, kX, kY + 44, 40, 40, "A", isKeyPressed(KeyEvent.VK_A));
                drawKeystroke(g2, kX + 44, kY + 44, 40, 40, "S", isKeyPressed(KeyEvent.VK_S));
                drawKeystroke(g2, kX + 88, kY + 44, 40, 40, "D", isKeyPressed(KeyEvent.VK_D));
                drawKeystroke(g2, kX, kY + 88, 62, 34, "LMB", isKeyPressed(MouseEvent.BUTTON1));
                drawKeystroke(g2, kX + 66, kY + 88, 62, 34, "RMB", isKeyPressed(MouseEvent.BUTTON3));
                drawKeystroke(g2, kX, kY + 126, 128, 24, "SPACE", isKeyPressed(KeyEvent.VK_SPACE));
            }

            // Bedwars 8-Team Matrix (Top Right)
            if (isModuleEnabled("Bed Status Matrix") || isModuleEnabled("Bedwars HUD")) {
                int bX = w - 190;
                int bY = isModuleEnabled("Keystrokes") ? 224 : 60;
                drawGlassBox(g2, bX, bY, 172, 170);
                g2.setColor(new Color(6, 182, 212));
                g2.setFont(new Font("Segoe UI", Font.BOLD, 12));
                g2.drawString("BEDWARS 8-TEAMS", bX + 12, bY + 20);

                String[] teams = {"[R] Red: ✓", "[B] Blue: ✓", "[G] Green: ✗", "[Y] Yellow: ✓", "[A] Aqua: ✓", "[W] White: ✓", "[P] Pink: ✗", "[S] Gray: ✓"};
                Color[] colors = {new Color(239, 68, 68), new Color(59, 130, 246), new Color(34, 197, 94), new Color(234, 179, 8), new Color(6, 182, 212), Color.WHITE, new Color(244, 114, 182), new Color(156, 163, 175)};
                for (int i = 0; i < teams.length; i++) {
                    g2.setColor(colors[i]);
                    g2.setFont(new Font("Segoe UI", Font.PLAIN, 11));
                    g2.drawString(teams[i], bX + 14 + (i % 2) * 80, bY + 44 + (i / 2) * 28);
                }
            }

            // Coordinates & Direction (Bottom Left)
            if (isModuleEnabled("Coordinates")) {
                drawGlassBox(g2, 18, h - 90, 230, 56);
                g2.setColor(Color.WHITE);
                g2.setFont(new Font("Segoe UI", Font.BOLD, 12));
                g2.drawString("XYZ: 124.5 / 68.0 / -342.1", 28, h - 68);
                g2.setColor(new Color(156, 163, 175));
                g2.setFont(new Font("Segoe UI", Font.PLAIN, 11));
                g2.drawString("Facing: North (-Z)  •  Biome: Plains", 28, h - 48);
            }

            // FastMath & AntiCheat Badge (Bottom Right)
            if (isModuleEnabled("FastMath Tables")) {
                g2.setColor(new Color(34, 197, 94));
                g2.setFont(new Font("Segoe UI", Font.BOLD, 11));
                g2.drawString("● Anti-Cheat Compliant  •  FastMath Active", w - 260, h - 34);
            }
        }

        private void renderClickGuiOverlay(Graphics2D g2, int w, int h) {
            // Semi-transparent backdrop
            g2.setColor(new Color(0, 0, 0, 180));
            g2.fillRect(0, 0, w, h);

            int guiW = 620;
            int guiH = 400;
            int guiX = (w - guiW) / 2;
            int guiY = (h - guiH) / 2;

            // Main ClickGUI Panel
            g2.setColor(new Color(17, 24, 39, 250));
            g2.fillRoundRect(guiX, guiY, guiW, guiH, 16, 16);
            g2.setColor(new Color(6, 182, 212, 140));
            g2.setStroke(new BasicStroke(1.5f));
            g2.drawRoundRect(guiX, guiY, guiW, guiH, 16, 16);

            // Header
            g2.setColor(new Color(6, 182, 212));
            g2.setFont(new Font("Segoe UI", Font.BOLD, 15));
            g2.drawString("SAMRAT CLIENT — MODULE CONFIGURATION", guiX + 24, guiY + 36);

            g2.setColor(new Color(156, 163, 175));
            g2.setFont(new Font("Segoe UI", Font.PLAIN, 12));
            g2.drawString("Click any module to toggle ON / OFF. Press [RIGHT-SHIFT] to return.", guiX + 24, guiY + 56);

            // Module Grid
            int col = 0;
            int row = 0;
            for (Module mod : core.getModuleManager().getModules()) {
                int mX = guiX + 24 + col * 190;
                int mY = guiY + 76 + row * 44;

                if (mod.isEnabled()) {
                    g2.setColor(new Color(6, 182, 212, 40));
                    g2.fillRoundRect(mX, mY, 180, 36, 8, 8);
                    g2.setColor(new Color(6, 182, 212, 180));
                    g2.drawRoundRect(mX, mY, 180, 36, 8, 8);
                    g2.setColor(Color.WHITE);
                } else {
                    g2.setColor(new Color(31, 41, 55, 180));
                    g2.fillRoundRect(mX, mY, 180, 36, 8, 8);
                    g2.setColor(new Color(55, 65, 81));
                    g2.drawRoundRect(mX, mY, 180, 36, 8, 8);
                    g2.setColor(new Color(156, 163, 175));
                }

                g2.setFont(new Font("Segoe UI", Font.BOLD, 12));
                g2.drawString(mod.getName(), mX + 12, mY + 22);

                col++;
                if (col >= 3) {
                    col = 0;
                    row++;
                }
                if (row >= 6) break;
            }
        }

        private boolean isKeyPressed(int keyCode) {
            return keyStates.getOrDefault(keyCode, false);
        }

        private void drawGlassBox(Graphics2D g2, int x, int y, int w, int h) {
            g2.setColor(new Color(17, 24, 39, 220));
            g2.fillRoundRect(x, y, w, h, 10, 10);
            g2.setColor(new Color(55, 65, 81, 180));
            g2.setStroke(new BasicStroke(1.0f));
            g2.drawRoundRect(x, y, w, h, 10, 10);
        }

        private void drawKeystroke(Graphics2D g2, int x, int y, int w, int h, String label, boolean active) {
            if (active) {
                g2.setColor(new Color(6, 182, 212, 200));
                g2.fillRoundRect(x, y, w, h, 8, 8);
                g2.setColor(new Color(17, 24, 39));
            } else {
                g2.setColor(new Color(31, 41, 55, 200));
                g2.fillRoundRect(x, y, w, h, 8, 8);
                g2.setColor(new Color(55, 65, 81));
                g2.drawRoundRect(x, y, w, h, 8, 8);
                g2.setColor(Color.WHITE);
            }
            g2.setFont(new Font("Segoe UI", Font.BOLD, 12));
            FontMetrics fm = g2.getFontMetrics();
            int strW = fm.stringWidth(label);
            int strH = fm.getAscent();
            g2.drawString(label, x + (w - strW) / 2, y + (h + strH) / 2 - 2);
        }
    }
}
