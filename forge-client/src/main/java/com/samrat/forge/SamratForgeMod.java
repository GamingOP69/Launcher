package com.samrat.forge;

import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiMainMenu;
import net.minecraft.client.settings.KeyBinding;
import net.minecraftforge.client.event.RenderGameOverlayEvent;
import net.minecraftforge.client.event.GuiOpenEvent;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.fml.client.registry.ClientRegistry;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.common.event.FMLInitializationEvent;
import net.minecraftforge.fml.common.event.FMLPreInitializationEvent;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;
import net.minecraftforge.fml.common.gameevent.TickEvent;
import org.apache.logging.log4j.Logger;
import org.lwjgl.input.Keyboard;

/** Forge 1.8.9 entrypoint with a small, informational client HUD. */
@Mod(modid = SamratForgeMod.MOD_ID, name = SamratForgeMod.NAME,
        version = SamratForgeMod.VERSION, acceptedMinecraftVersions = "[1.8.9]")
public final class SamratForgeMod {
    public static final String MOD_ID = "samratclient";
    public static final String NAME = "Samrat Client";
    public static final String VERSION = "1.0.0";

    private static final KeyBinding HUD_TOGGLE = new KeyBinding(
            "key.samrat.hud.toggle", Keyboard.KEY_RSHIFT, "key.categories.misc");

    private static Logger logger;
    private boolean smokeExitRequested;
    private boolean hudEnabled = true;
    private String[] hudLines = new String[0];

    @Mod.EventHandler
    public void preInitialize(FMLPreInitializationEvent event) {
        logger = event.getModLog();
        logger.info("SAMRAT_FORGE_PREINITIALIZED mc=1.8.9 version={}", VERSION);
    }

    @Mod.EventHandler
    public void initialize(FMLInitializationEvent event) {
        MinecraftForge.EVENT_BUS.register(this);
        ClientRegistry.registerKeyBinding(HUD_TOGGLE);
        logger.info("SAMRAT_FORGE_INITIALIZED mc=1.8.9");
    }

    @SubscribeEvent
    public void clientTick(TickEvent.ClientTickEvent event) {
        if (event.phase != TickEvent.Phase.END) {
            return;
        }

        Minecraft minecraft = Minecraft.getMinecraft();
        if (HUD_TOGGLE.isPressed()) {
            hudEnabled = !hudEnabled;
            logger.info("Samrat informational HUD {}", hudEnabled ? "enabled" : "disabled");
        }

        if (minecraft.thePlayer != null && minecraft.theWorld != null) {
            hudLines = HudPresentation.create(
                    Minecraft.getDebugFPS(),
                    minecraft.thePlayer.getPosition().getX(),
                    minecraft.thePlayer.getPosition().getY(),
                    minecraft.thePlayer.getPosition().getZ(),
                    minecraft.thePlayer.getHorizontalFacing().getName().toUpperCase(java.util.Locale.ROOT),
                    minecraft.gameSettings.keyBindForward.isKeyDown(),
                    minecraft.gameSettings.keyBindLeft.isKeyDown(),
                    minecraft.gameSettings.keyBindBack.isKeyDown(),
                    minecraft.gameSettings.keyBindRight.isKeyDown(),
                    minecraft.gameSettings.keyBindJump.isKeyDown(),
                    minecraft.thePlayer.isSprinting());
        } else {
            hudLines = new String[0];
        }
    }

    @SubscribeEvent
    public void renderOverlay(RenderGameOverlayEvent.Post event) {
        if (event.type != RenderGameOverlayEvent.ElementType.ALL) {
            return;
        }
        if (hudEnabled) {
            Minecraft minecraft = Minecraft.getMinecraft();
            for (int i = 0; i < hudLines.length; i++) {
                minecraft.fontRendererObj.drawStringWithShadow(
                        hudLines[i], 6.0F, 6.0F + (i * 10.0F), 0xFFFFFFFF);
            }
        }
    }

    @SubscribeEvent
    public void detectMainMenuForCiSmoke(GuiOpenEvent event) {
        if (!(event.gui instanceof GuiMainMenu)) {
            return;
        }

        logger.info("SAMRAT_MINECRAFT_MAIN_MENU_REACHED");
        if (!Boolean.getBoolean("samrat.ci.smoke") || smokeExitRequested) {
            return;
        }

        smokeExitRequested = true;
        logger.info("SAMRAT_SMOKE_MAIN_MENU_REACHED");
        Minecraft.getMinecraft().addScheduledTask(() -> Minecraft.getMinecraft().shutdown());
    }
}
