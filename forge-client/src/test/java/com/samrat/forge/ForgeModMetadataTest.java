package com.samrat.forge;

import org.junit.Test;
import net.minecraftforge.fml.common.Mod;

import static org.junit.Assert.assertEquals;

public class ForgeModMetadataTest {
    @Test
    public void targetsMinecraft189() {
        Mod mod = SamratForgeMod.class.getAnnotation(Mod.class);
        assertEquals("[1.8.9]", mod.acceptedMinecraftVersions());
        assertEquals("samratclient", SamratForgeMod.MOD_ID);
    }
}
