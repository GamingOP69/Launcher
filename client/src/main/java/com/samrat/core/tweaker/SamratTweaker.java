package com.samrat.core.tweaker;

import com.samrat.SamratClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * LaunchWrapper ITweaker entrypoint for Minecraft 1.8.9 client injection.
 * When launched via --tweakClass com.samrat.core.tweaker.SamratTweaker,
 * this class injects the Samrat Client runtime and registers transformers.
 */
public class SamratTweaker {
    private static final Logger LOGGER = LoggerFactory.getLogger(SamratTweaker.class);
    private final List<String> launchArgs = new ArrayList<>();
    private File gameDir;
    private File assetsDir;
    private String version;

    public void acceptOptions(List<String> args, File gameDir, File assetsDir, String version) {
        this.launchArgs.addAll(args);
        this.gameDir = gameDir;
        this.assetsDir = assetsDir;
        this.version = version;
        LOGGER.info("SamratTweaker accepted launch options for Minecraft 1.8.9.");
    }

    public void injectIntoClassLoader(Object classLoader) {
        LOGGER.info("Injecting Samrat Client core into classloader...");
        // Initialize client bootstrap early
        try {
            SamratClient.getInstance().initialize();
        } catch (Exception e) {
            LOGGER.error("Failed to initialize Samrat Client during tweaker injection: {}", e.getMessage(), e);
        }
    }

    public String getLaunchTarget() {
        return "net.minecraft.client.main.Main";
    }

    public String[] getLaunchArguments() {
        return launchArgs.toArray(new String[0]);
    }

    public File getGameDir() {
        return gameDir;
    }

    public File getAssetsDir() {
        return assetsDir;
    }

    public String getVersion() {
        return version;
    }
}
