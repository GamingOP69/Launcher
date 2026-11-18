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
