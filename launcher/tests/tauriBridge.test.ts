import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { invokeCommand } from '../src/services/tauriBridge.ts';

test('browser preview refuses to fabricate a persisted offline account', async () => {
  await assert.rejects(
    invokeCommand('add_offline_account', { username: 'PreviewUser' }),
    /only be created in the installed desktop launcher.*does not persist accounts/i,
  );
});

test('browser preview refuses to claim Minecraft launched', async () => {
  await assert.rejects(
    invokeCommand('launch_game'),
    /browser preview cannot launch Minecraft/i,
  );
});

test('browser preview refuses to claim profile persistence', async () => {
  await assert.rejects(invokeCommand('save_custom_profile', { name: 'Test', preset: 'BALANCED' }), /only in the installed desktop launcher/i);
  await assert.rejects(invokeCommand('delete_custom_profile', { name: 'Test' }), /only in the installed desktop launcher/i);
});

test('offline profile presentation does not request third-party avatar images', async () => {
  const [accountsPage, header, tauriConfig] = await Promise.all([
    readFile(new URL('../src/pages/AccountsPage.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/Header.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src-tauri/tauri.conf.json', import.meta.url), 'utf8'),
  ]);
  for (const source of [accountsPage, header, tauriConfig]) {
    assert.doesNotMatch(source, /mc-heads\.net/i);
  }
});

test('launcher UI does not use remote fonts or claim package validation is pending', async () => {
  const [styles, homePage, sidebar] = await Promise.all([
    readFile(new URL('../src/index.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/HomePage.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/Sidebar.tsx', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(styles, /fonts\.googleapis\.com|fonts\.gstatic\.com/i);
  assert.match(styles, /:focus-visible/);
  assert.match(homePage, /clientInstallationState === 'checking'/);
  assert.match(homePage, /clientInstallationState === 'error'/);
  assert.match(homePage, /RETRY INSTALL CHECK/);
  assert.doesNotMatch(sidebar, /Anti-Cheat Safe/i);
  assert.match(sidebar, /No combat automation/);
  assert.doesNotMatch(homePage, /Runtime Validation in Progress|Launch verification is pending/i);
});

test('profile presets are described as previews and failed persistence remains visible', async () => {
  const [app, nativeProfiles, home, profiles, bridge] = await Promise.all([
    readFile(new URL('../src/App.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src-tauri/src/commands.rs', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/HomePage.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/ProfilesPage.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/services/tauriBridge.ts', import.meta.url), 'utf8'),
  ]);
  for (const source of [app, nativeProfiles, home]) assert.match(source, /Selected Preview|not applied to Minecraft|no performance changes are applied/i);
  assert.match(profiles, /await invokeCommand\('save_custom_profile'/);
  assert.ok(profiles.indexOf("await invokeCommand('save_custom_profile'") < profiles.indexOf('onCreateProfile(clean, newPreset)'));
  assert.ok(profiles.indexOf("await invokeCommand('delete_custom_profile'") < profiles.indexOf('onDeleteProfile(id)'));
  assert.match(profiles, /role="alert"/);
  assert.match(bridge, /Profile persistence is available only in the installed desktop launcher/);
});
