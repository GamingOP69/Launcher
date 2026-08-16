package com.samrat.diagnostics;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;

public final class LogManager {
    private static final Logger LOGGER = LoggerFactory.getLogger(LogManager.class);
    private final File logsDir;
    private File currentLogFile;
    private BufferedWriter writer;

    public LogManager(File logsDir) {
        this.logsDir = logsDir;
    }

    public void initialize() {
        if (!logsDir.exists()) {
            logsDir.mkdirs();
        }

        rotateOldLogs();

        String filename = "client-" + new SimpleDateFormat("yyyy-MM-dd-HH-mm-ss").format(new Date()) + ".log";
        this.currentLogFile = new File(logsDir, filename);

        try {
            this.writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(currentLogFile, true), StandardCharsets.UTF_8));
            log("=== Samrat Client Session Started ===");
        } catch (IOException e) {
            LOGGER.error("Failed to initialize LogManager writer: {}", e.getMessage());
        }
    }

    public synchronized void log(String message) {
        if (writer == null) return;

        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS").format(new Date());
        String sanitized = Sanitizer.sanitize(message);
        try {
            writer.write("[" + timestamp + "] " + sanitized);
            writer.newLine();
            writer.flush();
        } catch (IOException ignored) {}
    }

    private void rotateOldLogs() {
        File[] files = logsDir.listFiles((dir, name) -> name.endsWith(".log"));
        if (files != null && files.length > 10) {
            // Sort by last modified and delete oldest
            java.util.Arrays.sort(files, java.util.Comparator.comparingLong(File::lastModified));
            for (int i = 0; i < files.length - 10; i++) {
                files[i].delete();
            }
        }
    }

    public void shutdown() {
        if (writer != null) {
            try {
                log("=== Samrat Client Session Ended Cleanly ===");
                writer.close();
            } catch (IOException ignored) {}
        }
    }

    public File getCurrentLogFile() {
        return currentLogFile;
    }
}
