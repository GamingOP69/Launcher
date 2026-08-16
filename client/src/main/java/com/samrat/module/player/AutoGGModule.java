package com.samrat.module.player;

import com.samrat.core.event.EventListener;
import com.samrat.core.event.events.ChatEvent;
import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.ModeSetting;
import com.samrat.core.setting.NumberSetting;

public class AutoGGModule extends Module {
    private final ModeSetting message = new ModeSetting("Message", "Message to send", "gg", "gg", "Good Game!", "GG WP");
    private final NumberSetting delaySeconds = new NumberSetting("Delay", "Delay before sending message in seconds", 0.5, 0.0, 3.0, 0.1, "s");

    private long lastTriggerTime = 0;

    public AutoGGModule() {
        super("Auto GG", "Automatically sends a polite GG message when a match ends", Category.PLAYER, 0, true);
        registerSetting(message);
        registerSetting(delaySeconds);
    }

    @EventListener
    public void onChat(ChatEvent event) {
        if (event.isOutgoing()) return;

        String msg = event.getMessage().toLowerCase();
        if (msg.contains("winner - ") || msg.contains("1st killer - ") || msg.contains("game over!") || msg.contains("you won!")) {
            long now = System.currentTimeMillis();
            if (now - lastTriggerTime > 10000) { // debounce by 10s
                lastTriggerTime = now;
                logger.info("Match end detected! Auto-sending: {}", message.getValue());
            }
        }
    }

    public String getMessageToSend() {
        return message.getValue();
    }
}
