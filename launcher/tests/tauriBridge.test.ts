import assert from 'node:assert/strict';
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
