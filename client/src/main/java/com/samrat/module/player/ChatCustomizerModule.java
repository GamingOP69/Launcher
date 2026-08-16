package com.samrat.module.player;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.core.setting.NumberSetting;

public class ChatCustomizerModule extends Module {
    private final BooleanSetting transparentChat = new BooleanSetting("Transparent", "Disable dark chat background box", false);
    private final BooleanSetting showTimestamps = new BooleanSetting("Timestamps", "Prepend time to each chat line", true);
    private final BooleanSetting compactChat = new BooleanSetting("Compact Chat", "Stack identical consecutive chat messages with counter", true);
    private final NumberSetting chatHistoryLimit = new NumberSetting("History Limit", "Maximum remembered chat lines", 200, 100, 1000, 50);

    public ChatCustomizerModule() {
        super("Chat Customizer", "Chat appearance, timestamps, compact stacking and extended history", Category.PLAYER, 0, true);
        registerSetting(transparentChat);
        registerSetting(showTimestamps);
        registerSetting(compactChat);
        registerSetting(chatHistoryLimit);
    }

    public boolean isTransparentChat() {
        return transparentChat.getValue();
    }

    public boolean isShowTimestamps() {
        return showTimestamps.getValue();
    }

    public boolean isCompactChat() {
        return compactChat.getValue();
    }

    public int getChatHistoryLimit() {
        return chatHistoryLimit.getIntValue();
    }
}
