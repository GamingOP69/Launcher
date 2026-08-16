package com.samrat.diagnostics;

import com.samrat.SamratClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;

public final class CrashReporter {
    private static final Logger LOGGER = LoggerFactory.getLogger(CrashReporter.class);
    private final File crashDir;

    public CrashReporter(File crashDir) {
        this.crashDir = crashDir;
    }

    public File createCrashReport(Throwable throwable, String context) {
        if (!crashDir.exists()) {
            crashDir.mkdirs();
        }

        String report = generateReportString(throwable, context);
        String filename = "crash-" + new SimpleDateFormat("yyyy-MM-dd_HH.mm.ss").format(new Date()) + ".txt";
        File file = new File(crashDir, filename);

        try (Writer writer = new OutputStreamWriter(new FileOutputStream(file), StandardCharsets.UTF_8)) {
            writer.write(report);
            LOGGER.error("Crash report generated at: {}", file.getAbsolutePath());
        } catch (IOException e) {
            LOGGER.error("Failed to write crash report to disk: {}", e.getMessage());
        }

        return file;
    }

    public String generateReportString(Throwable throwable, String context) {
        StringBuilder sb = new StringBuilder();
        sb.append("---- SAMRAT CLIENT CRASH REPORT ----\n");
        sb.append("// Don't panic! This report has been automatically sanitized.\n\n");

        sb.append("Time: ").append(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss z").format(new Date())).append("\n");
        sb.append("Description: ").append(context != null ? context : "Unexpected runtime exception").append("\n\n");

        sb.append("== System Details ==\n");
        sb.append("Samrat Version: ").append(SamratClient.VERSION).append("\n");
        sb.append("Minecraft Version: ").append(SamratClient.MINECRAFT_VERSION).append("\n");
        sb.append("Operating System: ").append(SystemInfo.getOperatingSystem()).append("\n");
        sb.append("Java Version: ").append(SystemInfo.getJavaVersion()).append("\n");
        sb.append("Memory: ").append(SystemInfo.getMemoryStats()).append("\n");
        sb.append("CPU Cores: ").append(SystemInfo.getAvailableProcessors()).append("\n\n");

        sb.append("== Exception Stacktrace ==\n");
        if (throwable != null) {
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            throwable.printStackTrace(pw);
            sb.append(sw.toString());
        } else {
            sb.append("No throwable provided.\n");
        }

        return Sanitizer.sanitize(sb.toString());
    }
}
