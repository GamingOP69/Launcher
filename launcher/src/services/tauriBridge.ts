import { AccountStorage, AuthAccount } from '../types/account';
import { JavaRuntimeInfo, SystemDiagnostics } from '../types/diagnostics';
import { UpdateCheckResult } from '../types/version';

const isTauri =
  typeof window !== 'undefined' &&
  ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

export async function invokeCommand<T>(
  command: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  if (isTauri) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<T>(command, args);
  }
  return mockInvoke<T>(command, args);
}

export async function listenEvent<T>(
  event: string,
  handler: (payload: T) => void
): Promise<() => void> {
  if (isTauri) {
    const { listen } = await import('@tauri-apps/api/event');
    const unlisten = await listen<T>(event, (e) => handler(e.payload));
    return unlisten;
  }
  return () => {};
}

// ─── Dev Mock (browser preview only) ─────────────────────────────────────────
function mockInvoke<T>(command: string, args: Record<string, unknown>): Promise<T> {
  switch (command) {
    case 'get_accounts':
      return Promise.resolve({
        active_account_id: 'local_player',
        accounts: [
          {
            id: 'local_player',
            username: 'SamratPlayer',
            uuid: 'c06f8906-4c8a-4911-9c29-ea1db5022e33',
            access_token: 'local_token',
            expires_at: 0,
            is_dev_mode: false,
            avatar_url: 'https://mc-heads.net/avatar/Steve/100',
          },
        ],
      } as unknown as T);

    case 'add_offline_account': {
      const name = (args.username as string) || 'Player';
      const skin = (args.skinType as string) || 'steve';
      const avatar =
        skin === 'alex'
          ? 'https://mc-heads.net/avatar/MHF_Alex/100'
          : skin === 'steve'
          ? 'https://mc-heads.net/avatar/MHF_Steve/100'
          : `https://mc-heads.net/avatar/${name}/100`;
      return Promise.resolve({
        id: `local_${name.toLowerCase()}`,
        username: name,
        uuid: 'c06f8906-4c8a-4911-9c29-ea1db5022e33',
        access_token: 'local_token',
        expires_at: 0,
        is_dev_mode: false,
        avatar_url: avatar,
      } as unknown as T);
    }

    case 'check_client_installed':
      return Promise.resolve({
        installed: true,
        jar_path: '/home/.samrat/client/samrat-client-1.8.9.jar',
        jar_size_bytes: 1420580,
      } as unknown as T);

    case 'download_client':
      return new Promise((resolve) =>
        setTimeout(() => resolve('/home/.samrat/client/samrat-client-1.8.9.jar' as unknown as T), 1500)
      );

    case 'get_client_modules':
      return Promise.resolve([
        { id: 'fps', name: 'FPS Display', category: 'HUD', description: 'Real-time framerate monitor', enabled: true },
        { id: 'cps', name: 'CPS Display', category: 'HUD', description: 'Accurate click-per-second tracker', enabled: true },
        { id: 'ping', name: 'Ping Display', category: 'HUD', description: 'Round-trip server latency display', enabled: true },
        { id: 'keystrokes', name: 'Keystrokes', category: 'HUD', description: 'Overlay for movement keys and clicks', enabled: true },
        { id: 'coords', name: 'Coordinates', category: 'HUD', description: 'Precise XYZ player position', enabled: true },
        { id: 'bed_matrix', name: 'Bed Status Matrix', category: 'Bedwars', description: 'Live tracking of all 8 team beds', enabled: true },
        { id: 'res_timers', name: 'Resource Timer', category: 'Bedwars', description: 'Countdown timers for generators', enabled: true },
        { id: 'combo', name: 'Combo Counter', category: 'PvP', description: 'Consecutive hit tracker', enabled: true },
        { id: 'crosshair', name: 'Custom Crosshair', category: 'PvP', description: 'Custom geometric crosshair', enabled: true },
        { id: 'fastmath', name: 'FastMath Tables', category: 'Performance', description: 'Trigonometric lookup table acceleration', enabled: true },
        { id: 'zoom', name: 'OptiFine Zoom', category: 'Player', description: 'Cinematic smooth zoom magnification on C key', enabled: true },
        { id: 'low_fire', name: 'Low Fire', category: 'Visual', description: 'Lowers fire rendering overlay in PvP', enabled: true },
        { id: 'old_anim', name: '1.7 Old Animations', category: 'Visual', description: 'Classic 1.7 blockhit, sword swing, and rod animations', enabled: true },
      ] as unknown as T);

    case 'toggle_client_module':
      return Promise.resolve(undefined as unknown as T);

    case 'get_saved_profiles':
      return Promise.resolve([
        { id: 'Default', name: 'Default', description: 'Standard balanced client configuration', is_preset: true, performance_preset: 'BALANCED' },
        { id: 'Bedwars', name: 'Bedwars', description: 'Optimized HUD, team trackers and resource timers', is_preset: true, performance_preset: 'BALANCED' },
        { id: 'PvP', name: 'PvP', description: 'Aggressive combo tracking and custom crosshair', is_preset: true, performance_preset: 'HIGH_FPS' },
        { id: 'FPS', name: 'FPS Boost', description: 'Maximum framerate tuning with aggressive culling', is_preset: true, performance_preset: 'HIGH_FPS' },
      ] as unknown as T);

    case 'save_custom_profile':
    case 'delete_custom_profile':
      return Promise.resolve(undefined as unknown as T);

    case 'get_curated_mods':
      return Promise.resolve([
        {
          id: 'optifine_189',
          name: 'OptiFine 1.8.9 HD U M5',
          version: '1.8.9-HD-U-M5',
          author: 'sp614x',
          description: 'Essential FPS booster with shaderpack support, connected textures, and dynamic lighting.',
          category: 'Performance & Graphics',
          download_url: 'https://optifine.net',
          filename: 'OptiFine_1.8.9_HD_U_M5.jar',
          installed: false,
          size_kb: 2450,
        },
        {
          id: 'old_animations',
          name: '1.7 Old Animations Mod',
          version: '2.4.2',
          author: 'SpiderFrog',
          description: 'Restores authentic 1.7 block-hitting, bow drawing, and eating motion to 1.8.9.',
          category: 'Animation',
          download_url: 'https://github.com/GamingOP69/Launcher',
          filename: 'OldAnimations-2.4.2-1.8.9.jar',
          installed: true,
          size_kb: 420,
        },
        {
          id: 'scrollable_tooltips',
          name: 'Scrollable Tooltips',
          version: '1.3',
          author: 'Sk1er',
          description: 'Enables smooth mouse-wheel scrolling on long enchantment tooltips and item lores in shops.',
          category: 'HUD & Quality of Life',
          download_url: 'https://github.com/GamingOP69/Launcher',
          filename: 'ScrollableTooltips-1.3-1.8.9.jar',
          installed: false,
          size_kb: 180,
        },
        {
          id: 'autotip',
          name: 'AutoTip 1.8.9',
          version: '3.0.1',
          author: 'Sk1er & 2Pi',
          description: 'Automatically sends tips to network booster holders on Hypixel to earn free experience and coins.',
          category: 'Utility',
          download_url: 'https://github.com/GamingOP69/Launcher',
          filename: 'AutoTip-3.0.1-1.8.9.jar',
          installed: false,
          size_kb: 310,
        },
        {
          id: 'memoryfix',
          name: 'MemoryFix 1.8.9',
          version: '1.0.0',
          author: 'Prplz',
          description: 'Fixes an aggressive memory leak in vanilla 1.8.9 FontRenderer and world texture garbage collections.',
          category: 'Performance',
          download_url: 'https://github.com/GamingOP69/Launcher',
          filename: 'MemoryFix-1.8.9.jar',
          installed: false,
          size_kb: 45,
        },
      ] as unknown as T);

    case 'download_curated_mod':
      return new Promise((resolve) => setTimeout(() => resolve('mods/downloaded.jar' as unknown as T), 1200));

    case 'delete_mod_file':
      return Promise.resolve(undefined as unknown as T);

    case 'launch_game':
      return Promise.resolve(1337 as unknown as T);

    case 'terminate_game':
      return Promise.resolve(undefined as unknown as T);

    case 'is_game_running':
      return Promise.resolve(false as unknown as T);

    case 'detect_java':
      return Promise.resolve([
        { path: 'C:\\Program Files\\Eclipse Adoptium\\jdk-17\\bin\\javaw.exe', version: '17.0.10', is_64_bit: true, vendor: 'Adoptium Temurin', is_recommended: true },
      ] as unknown as T);

    case 'open_folder':
      return Promise.resolve('' as unknown as T);

    case 'get_system_info':
      return Promise.resolve({
        os: 'windows',
        arch: 'x86_64',
        num_cpus: 8,
        total_memory_mb: 16384,
        free_memory_mb: 8192,
      } as unknown as T);

    case 'get_launcher_logs':
      return Promise.resolve([
        '[SYSTEM] Samrat Launcher v1.0.0 initialized.',
        '[AUTH] Loaded offline player storage.',
        '[CONFIG] Synchronized module settings with .samrat/config.json',
      ] as unknown as T);

    case 'check_updates':
      return Promise.resolve({
        update_available: false,
        current_version: '1.0.0',
        latest_version: '1.0.0',
        changelog: [],
      } as unknown as T);

    default:
      return Promise.resolve({} as T);
  }
}
