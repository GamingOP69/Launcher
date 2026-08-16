package com.samrat;

import com.samrat.core.SamratCore;
import com.samrat.gui.StandaloneClientWindow;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.swing.SwingUtilities;

/**
 * SamratClient is the primary client bootstrap and singleton container.
 * It coordinates startup, lifecycle hooks, standalone GUI window, and safe shutdown.
 */
public final class SamratClient {
    public static final String NAME = "Samrat Client";
    public static final String VERSION = "1.0.0";
    public static final String MINECRAFT_VERSION = "1.8.9";
    public static final String AUTHOR = "Samrat Team";

    private static final Logger LOGGER = LoggerFactory.getLogger(SamratClient.class);
    private static SamratClient instance;

    private final SamratCore core;
    private boolean initialized = false;
    private long startupTimeMs = 0;

    private SamratClient() {
        this.core = new SamratCore();
    }

    public static synchronized SamratClient getInstance() {
        if (instance == null) {
            instance = new SamratClient();
        }
        return instance;
    }

    /**
     * Initializes the client ecosystem, registers modules, loads configuration,
     * and prepares the HUD and rendering systems.
     */
    public synchronized void initialize() {
        if (initialized) {
            LOGGER.warn("SamratClient is already initialized.");
            return;
        }

        long start = System.currentTimeMillis();
        LOGGER.info("Initializing {} v{} for Minecraft {}...", NAME, VERSION, MINECRAFT_VERSION);

        try {
            // Initialize Core subsystems
            this.core.initialize();
            
            // Register JVM shutdown hook for safe config save
            Runtime.getRuntime().addShutdownHook(new Thread(this::shutdown, "SamratClient-ShutdownHook"));

            this.initialized = true;
            this.startupTimeMs = System.currentTimeMillis() - start;
            LOGGER.info("{} successfully initialized in {}ms.", NAME, startupTimeMs);
        } catch (Exception e) {
            LOGGER.error("Fatal error during SamratClient initialization: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to initialize Samrat Client", e);
        }
    }

    /**
     * Safely shuts down the client, persisting all active profiles and configs.
     */
    public synchronized void shutdown() {
        if (!initialized) {
            return;
        }
        LOGGER.info("Shutting down {}...", NAME);
        try {
            this.core.shutdown();
            this.initialized = false;
            LOGGER.info("{} shutdown complete.", NAME);
        } catch (Exception e) {
            LOGGER.error("Error during shutdown: {}", e.getMessage(), e);
        }
    }

    public SamratCore getCore() {
        return core;
    }

    public boolean isInitialized() {
        return initialized;
    }

    public long getStartupTimeMs() {
        return startupTimeMs;
    }

    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println(" " + NAME + " v" + VERSION + " (" + MINECRAFT_VERSION + ")");
        System.out.println(" Unofficial, High-Performance PvP/Bedwars Client");
        System.out.println("=================================================");

        String username = "SamratPlayer";
        String profileName = "Default";
        int width = 1280;
        int height = 720;

        // Parse CLI arguments
        for (int i = 0; i < args.length; i++) {
            if ("--username".equalsIgnoreCase(args[i]) && i + 1 < args.length) {
                username = args[++i];
            } else if ("--width".equalsIgnoreCase(args[i]) && i + 1 < args.length) {
                try { width = Integer.parseInt(args[++i]); } catch (NumberFormatException ignored) {}
            } else if ("--height".equalsIgnoreCase(args[i]) && i + 1 < args.length) {
                try { height = Integer.parseInt(args[++i]); } catch (NumberFormatException ignored) {}
            } else if ("--profile".equalsIgnoreCase(args[i]) && i + 1 < args.length) {
                profileName = args[++i];
            }
        }

        SamratClient client = getInstance();
        client.initialize();

        final String finalUsername = username;
        final String finalProfile = profileName;
        final int finalWidth = width;
        final int finalHeight = height;

        // Launch Standalone GUI Window
        SwingUtilities.invokeLater(() -> {
            try {
                StandaloneClientWindow window = new StandaloneClientWindow(
                        client.getCore(),
                        finalUsername,
                        finalProfile,
                        finalWidth,
                        finalHeight
                );
                window.setVisible(true);
                LOGGER.info("Samrat Client game window opened successfully for user: {}", finalUsername);
            } catch (Exception e) {
                LOGGER.error("Failed to display client window: {}", e.getMessage(), e);
            }
        });
    }
}
