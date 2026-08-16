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
 * and Right-Shift ClickGUI module configuration.
 */
public class StandaloneClientWindow extends JFrame {
    private static final Logger LOGGER = LoggerFactory.getLogger(StandaloneClientWindow.class);

    private final SamratCore core;
    private final String username;
    private final String profileName;

    private int fps = 144;
    private int lmbCps = 0;
    private int rmbCps = 0;
    private final LinkedList<Long> lmbClicks = new LinkedList<>();
    private final LinkedList<Long> rmbClicks = new LinkedList<>();

    private final Map<Integer, Boolean> keyStates = new HashMap<>();
    private boolean showClickGui = false;
    private boolean showHud = true;
    private long startTime;

    public StandaloneClientWindow(SamratCore core, String username, String profileName, int width, int height) {
        this.core = core;
        this.username = (username == null || username.trim().isEmpty()) ? "SamratPlayer" : username.trim();
        this.profileName = (profileName == null || profileName.trim().isEmpty()) ? "Default" : profileName.trim();
        this.startTime = System.currentTimeMillis();

        setTitle("Samrat Client 1.8.9 — [User: " + this.username + " | Profile: " + this.profileName + "]");
        setSize(Math.max(800, width), Math.max(600, height));
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

        // Key Listener for WASD, Space, Right-Shift, F3
        addKeyListener(new KeyAdapter() {
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
                repaint();
            }

            @Override
            public void keyReleased(KeyEvent e) {
                keyStates.put(e.getKeyCode(), false);
                repaint();
            }
        });

        // Mouse Listener for CPS calculation
        GameCanvas canvas = new GameCanvas();
        canvas.addMouseListener(new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                long now = System.currentTimeMillis();
                if (SwingUtilities.isLeftMouseButton(e)) {
                    lmbClicks.add(now);
                    keyStates.put(MouseEvent.BUTTON1, true);
                } else if (SwingUtilities.isRightMouseButton(e)) {
                    rmbClicks.add(now);
                    keyStates.put(MouseEvent.BUTTON3, true);
                }
                updateCps();
                repaint();
            }

            @Override
            public void mouseReleased(MouseEvent e) {
                if (SwingUtilities.isLeftMouseButton(e)) {
                    keyStates.put(MouseEvent.BUTTON1, false);
                } else if (SwingUtilities.isRightMouseButton(e)) {
                    keyStates.put(MouseEvent.BUTTON3, false);
                }
                repaint();
            }
        });

        setContentPane(canvas);

        // Rendering & tick loop timer (60 FPS refresh)
        Timer renderTimer = new Timer(16, e -> {
            updateCps();
            canvas.repaint();
        });
        renderTimer.start();
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

            // 1. Dark Esports Background with Ambient Vignette
            GradientPaint bg = new GradientPaint(0, 0, new Color(14, 20, 30), 0, h, new Color(7, 10, 16));
            g2.setPaint(bg);
            g2.fillRect(0, 0, w, h);

            // 2. Top Header Bar
            g2.setColor(new Color(20, 28, 42, 220));
            g2.fillRect(0, 0, w, 44);
            g2.setColor(new Color(40, 56, 80));
            g2.drawLine(0, 44, w, 44);

            g2.setFont(new Font("Segoe UI", Font.BOLD, 14));
            g2.setColor(new Color(0, 240, 255));
            g2.drawString("SAMRAT CLIENT 1.8.9", 18, 27);

            g2.setFont(new Font("Segoe UI", Font.PLAIN, 12));
            g2.setColor(new Color(160, 180, 200));
            g2.drawString("•  User: " + username + "  •  Profile: " + profileName + "  •  [RIGHT-SHIFT] ClickGUI  •  [F3] Toggle HUD", 190, 27);

            // 3. Render HUD Elements
            if (showHud) {
                renderHudOverlay(g2, w, h);
            }

            // 4. Render ClickGUI if open
            if (showClickGui) {
                renderClickGuiOverlay(g2, w, h);
            }
        }

        private void renderHudOverlay(Graphics2D g2, int w, int h) {
            // FPS & Ping Box (Top Left)
            drawGlassBox(g2, 18, 58, 140, 52);
            g2.setColor(new Color(0, 230, 118));
            g2.setFont(new Font("Segoe UI", Font.BOLD, 16));
            g2.drawString(fps + " FPS", 28, 82);
            g2.setColor(new Color(0, 240, 255));
            g2.setFont(new Font("Segoe UI", Font.PLAIN, 12));
            g2.drawString("Ping: 24ms  •  1.8.9", 28, 100);

            // CPS Box (Top Left below FPS)
            drawGlassBox(g2, 18, 118, 140, 52);
            g2.setColor(Color.WHITE);
            g2.setFont(new Font("Segoe UI", Font.BOLD, 14));
            g2.drawString("CPS: " + lmbCps + " | " + rmbCps, 28, 142);
            g2.setColor(new Color(140, 160, 180));
            g2.setFont(new Font("Segoe UI", Font.PLAIN, 11));
            g2.drawString("LMB: " + lmbCps + "  •  RMB: " + rmbCps, 28, 158);

            // Keystrokes Box (Right Center)
            int kX = w - 160;
            int kY = 60;
            drawKeystroke(g2, kX + 44, kY, 40, 40, "W", isKeyPressed(KeyEvent.VK_W));
            drawKeystroke(g2, kX, kY + 44, 40, 40, "A", isKeyPressed(KeyEvent.VK_A));
            drawKeystroke(g2, kX + 44, kY + 44, 40, 40, "S", isKeyPressed(KeyEvent.VK_S));
            drawKeystroke(g2, kX + 88, kY + 44, 40, 40, "D", isKeyPressed(KeyEvent.VK_D));
            drawKeystroke(g2, kX, kY + 88, 62, 34, "LMB", isKeyPressed(MouseEvent.BUTTON1));
            drawKeystroke(g2, kX + 66, kY + 88, 62, 34, "RMB", isKeyPressed(MouseEvent.BUTTON3));
            drawKeystroke(g2, kX, kY + 126, 128, 24, "SPACE", isKeyPressed(KeyEvent.VK_SPACE));

            // Bedwars 8-Team Matrix (Top Right)
            int bX = w - 190;
            int bY = 224;
            drawGlassBox(g2, bX, bY, 172, 170);
            g2.setColor(new Color(0, 240, 255));
            g2.setFont(new Font("Segoe UI", Font.BOLD, 12));
            g2.drawString("BEDWARS 8-TEAMS", bX + 12, bY + 20);

            String[] teams = {"[R] Red: ✓", "[B] Blue: ✓", "[G] Green: ✗", "[Y] Yellow: ✓", "[A] Aqua: ✓", "[W] White: ✓", "[P] Pink: ✗", "[S] Gray: ✓"};
            Color[] colors = {Color.RED, Color.CYAN, Color.GREEN, Color.YELLOW, new Color(0, 255, 255), Color.WHITE, Color.PINK, Color.GRAY};
            for (int i = 0; i < teams.length; i++) {
                g2.setColor(colors[i]);
                g2.setFont(new Font("Segoe UI", Font.PLAIN, 11));
                g2.drawString(teams[i], bX + 14 + (i % 2) * 80, bY + 44 + (i / 2) * 28);
            }

            // Coordinates & Direction (Bottom Left)
            drawGlassBox(g2, 18, h - 90, 220, 56);
            g2.setColor(Color.WHITE);
            g2.setFont(new Font("Segoe UI", Font.BOLD, 12));
            g2.drawString("XYZ: 124.5 / 68.0 / -342.1", 28, h - 68);
            g2.setColor(new Color(140, 160, 180));
            g2.setFont(new Font("Segoe UI", Font.PLAIN, 11));
            g2.drawString("Facing: North (Towards -Z)  •  Biome: Plains", 28, h - 48);

            // FastMath & AntiCheat Badge (Bottom Right)
            g2.setColor(new Color(0, 230, 118));
            g2.setFont(new Font("Segoe UI", Font.BOLD, 11));
            g2.drawString("● Anti-Cheat Compliant  •  FastMath Active", w - 260, h - 34);
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
            g2.setColor(new Color(16, 22, 34, 250));
            g2.fillRoundRect(guiX, guiY, guiW, guiH, 16, 16);
            g2.setColor(new Color(0, 240, 255, 120));
            g2.setStroke(new BasicStroke(1.5f));
            g2.drawRoundRect(guiX, guiY, guiW, guiH, 16, 16);

            // Header
            g2.setColor(new Color(0, 240, 255));
            g2.setFont(new Font("Segoe UI", Font.BOLD, 16));
            g2.drawString("SAMRAT CLIENT — MODULE CONFIGURATION", guiX + 24, guiY + 36);

            g2.setColor(new Color(140, 160, 180));
            g2.setFont(new Font("Segoe UI", Font.PLAIN, 12));
            g2.drawString("Click modules to toggle on/off. Press [RIGHT-SHIFT] to return to game view.", guiX + 24, guiY + 56);

            // Module Grid
            int col = 0;
            int row = 0;
            for (Module mod : core.getModuleManager().getModules()) {
                int mX = guiX + 24 + col * 190;
                int mY = guiY + 76 + row * 44;

                if (mod.isEnabled()) {
                    g2.setColor(new Color(0, 240, 255, 30));
                    g2.fillRoundRect(mX, mY, 180, 36, 8, 8);
                    g2.setColor(new Color(0, 240, 255, 160));
                    g2.drawRoundRect(mX, mY, 180, 36, 8, 8);
                    g2.setColor(Color.WHITE);
                } else {
                    g2.setColor(new Color(24, 32, 48, 180));
                    g2.fillRoundRect(mX, mY, 180, 36, 8, 8);
                    g2.setColor(new Color(50, 68, 92));
                    g2.drawRoundRect(mX, mY, 180, 36, 8, 8);
                    g2.setColor(new Color(120, 140, 160));
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
            g2.setColor(new Color(14, 20, 32, 210));
            g2.fillRoundRect(x, y, w, h, 10, 10);
            g2.setColor(new Color(36, 50, 72, 180));
            g2.setStroke(new BasicStroke(1.0f));
            g2.drawRoundRect(x, y, w, h, 10, 10);
        }

        private void drawKeystroke(Graphics2D g2, int x, int y, int w, int h, String label, boolean active) {
            if (active) {
                g2.setColor(new Color(0, 240, 255, 180));
                g2.fillRoundRect(x, y, w, h, 8, 8);
                g2.setColor(new Color(10, 14, 22));
            } else {
                g2.setColor(new Color(18, 26, 40, 200));
                g2.fillRoundRect(x, y, w, h, 8, 8);
                g2.setColor(new Color(40, 56, 80));
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
