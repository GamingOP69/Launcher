import { AccountStorage, AuthAccount, DeviceCodeResponse } from '../types/account';
import { LauncherConfig } from '../types/config';
import { JavaRuntimeInfo, SystemDiagnostics } from '../types/diagnostics';
import { UpdateCheckResult } from '../types/version';

const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

export async function invokeCommand<T>(command: string, args: Record<string, unknown> = {}): Promise<T> {
  if (isTauri) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<T>(command, args);
    } catch (e) {
      console.warn(`Tauri invoke error on ${command}:`, e);
      throw e;
    }
  }

  // Web Browser / Dev Mock Fallback
  return mockInvoke<T>(command, args);
}

function mockInvoke<T>(command: string, args: Record<string, unknown>): Promise<T> {
  console.log(`[Mock Tauri IPC] ${command}`, args);

  switch (command) {
    case 'get_accounts':
      return Promise.resolve({
        active_account_id: 'dev-samratdeveloper',
        accounts: [
          {
            id: 'dev-samratdeveloper',
            username: 'SamratDeveloper',
            uuid: '00000000-0000-0000-0000-000000000000',
            access_token: 'mock_token',
            expires_at: 9999999999,
            is_dev_mode: true,
            avatar_url: 'https://mc-heads.net/avatar/SamratDeveloper/100',
          },
        ],
      } as unknown as T);

    case 'detect_java':
      return Promise.resolve([
        {
          path: 'C:\\Program Files\\Eclipse Adoptium\\jdk-8.0.382.05-hotspot\\bin\\java.exe',
          version: '1.8.0_382',
          is_64_bit: true,
          vendor: 'Adoptium Temurin',
          is_recommended: true,
        },
        {
          path: 'C:\\Program Files\\Java\\jdk-17\\bin\\java.exe',
          version: '17.0.8',
          is_64_bit: true,
          vendor: 'Oracle Corporation',
          is_recommended: true,
        },
      ] as unknown as T);

    case 'get_system_info':
      return Promise.resolve({
        os: 'windows',
        arch: 'x86_64',
        num_cpus: 8,
        total_memory_mb: 16384,
        free_memory_mb: 8192,
      } as unknown as T);

    case 'check_updates':
      return Promise.resolve({
        update_available: false,
        current_version: '1.0.0',
        latest_version: '1.0.0',
        changelog: [
          '⚡ Complete Samrat Client 1.8.9 Release',
          '⚡ Bedwars & PvP Real-time HUD system',
          '⚡ High-Performance Zero-Allocation Event Engine',
        ],
      } as unknown as T);

    case 'is_game_running':
      return Promise.resolve(false as unknown as T);

    case 'launch_game':
      return Promise.resolve(1337 as unknown as T);

    case 'terminate_game':
      return Promise.resolve(undefined as unknown as T);

    case 'request_ms_device_code':
      return Promise.resolve({
        user_code: 'SAMR-AT99',
        device_code: 'mock-device-code',
        verification_uri: 'https://microsoft.com/link',
        expires_in: 900,
        interval: 5,
        message: 'To sign in, use a web browser to open https://microsoft.com/link and enter code SAMR-AT99',
      } as unknown as T);

    case 'poll_ms_auth':
      return Promise.resolve({
        id: 'ms-authenticated-user',
        username: 'ProBedwarsPlayer',
        uuid: 'c06f8906-4c8a-4911-9c29-ea1db5022e33',
        access_token: 'secure_oauth_token',
        expires_at: Date.now() + 86400000,
        is_dev_mode: false,
        avatar_url: 'https://mc-heads.net/avatar/ProBedwarsPlayer/100',
      } as unknown as T);

    case 'add_dev_account':
      const name = (args.username as string) || 'DevPlayer';
      return Promise.resolve({
        id: `dev-${name.toLowerCase()}`,
        username: name,
        uuid: '00000000-0000-0000-0000-000000000000',
        access_token: 'dev_token',
        expires_at: 9999999999,
        is_dev_mode: true,
        avatar_url: `https://mc-heads.net/avatar/${name}/100`,
      } as unknown as T);

    default:
      return Promise.resolve({} as T);
  }
}
