package com.samrat.forge;

import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiMainMenu;
import net.minecraftforge.client.event.RenderGameOverlayEvent;
import net.minecraftforge.client.event.GuiOpenEvent;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.common.event.FMLInitializationEvent;
import net.minecraftforge.fml.common.event.FMLPreInitializationEvent;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;
import org.apache.logging.log4j.Logger;

/** Minimal real Forge entrypoint. In-game features are added only after this
 * module is installed and its runtime lifecycle is verified. */
@Mod(modid = SamratForgeMod.MOD_ID, name = SamratForgeMod.NAME,
        version = SamratForgeMod.VERSION, acceptedMinecraftVersions = "[1.8.9]")
public final class SamratForgeMod {
    public static final String MOD_ID = "samratclient";
    public static final String NAME = "Samrat Client";
    public static final String VERSION = "1.0.0";

    private static Logger logger;
    private boolean smokeExitRequested;

    @Mod.EventHandler
    public void preInitialize(FMLPreInitializationEvent event) {
        logger = event.getModLog();
        logger.info("SAMRAT_FORGE_PREINITIALIZED mc=1.8.9 version={}", VERSION);
    }

    @Mod.EventHandler
    public void initialize(FMLInitializationEvent event) {
        MinecraftForge.EVENT_BUS.register(this);
        logger.info("SAMRAT_FORGE_INITIALIZED mc=1.8.9");
    }

    @SubscribeEvent
    public void renderOverlay(RenderGameOverlayEvent.Post event) {
        if (event.type != RenderGameOverlayEvent.ElementType.ALL) {
            return;
        }
        Minecraft minecraft = Minecraft.getMinecraft();
        if (minecraft.thePlayer != null && minecraft.theWorld != null) {
            minecraft.fontRendererObj.drawStringWithShadow(
                    "Samrat 1.8.9", 6.0F, 6.0F, 0xFFFFFFFF);
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
