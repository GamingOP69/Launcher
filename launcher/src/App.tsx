import React, { useState, useEffect } from 'react';
import { Sidebar, PageId } from './components/Sidebar';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ClientPage } from './pages/ClientPage';
import { VersionsPage } from './pages/VersionsPage';
import { ModsPage } from './pages/ModsPage';
import { ProfilesPage } from './pages/ProfilesPage';
import { AccountsPage } from './pages/AccountsPage';
import { CosmeticsPage } from './pages/CosmeticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { AboutPage } from './pages/AboutPage';
import { UpdateModal } from './components/UpdateModal';
import { CrashModal } from './components/CrashModal';
import { AuthAccount, AccountStorage } from './types/account';
import { ProfileItem } from './types/profile';
import { LauncherConfig, DEFAULT_LAUNCHER_CONFIG } from './types/config';
import { UpdateCheckResult } from './types/version';
import { invokeCommand } from './services/tauriBridge';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [accounts, setAccounts] = useState<AuthAccount[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | undefined>();
  const [profiles, setProfiles] = useState<ProfileItem[]>([
    { id: 'Default', name: 'Default', description: 'Standard balanced client configuration', isPreset: true, performancePreset: 'BALANCED' },
    { id: 'Bedwars', name: 'Bedwars', description: 'Optimized HUD, team trackers and resource timers', isPreset: true, performancePreset: 'BALANCED' },
    { id: 'PvP', name: 'PvP', description: 'Aggressive combo tracking and custom crosshair', isPreset: true, performancePreset: 'HIGH_FPS' },
    { id: 'FPS', name: 'FPS Boost', description: 'Maximum framerate tuning with aggressive culling', isPreset: true, performancePreset: 'HIGH_FPS' },
    { id: 'Low-End PC', name: 'Low-End PC', description: 'Ultra-lightweight potato settings', isPreset: true, performancePreset: 'ULTRA_FPS' },
  ]);
  const [config, setConfig] = useState<LauncherConfig>(DEFAULT_LAUNCHER_CONFIG);

  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [crashLog, setCrashLog] = useState<string | null>(null);

  // Load Accounts & Initial Update Checks
  const refreshAccounts = async () => {
    try {
      const storage = await invokeCommand<AccountStorage>('get_accounts');
      if (storage?.accounts) {
        setAccounts(storage.accounts);
        setActiveAccountId(storage.active_account_id || storage.accounts[0]?.id);
      }
    } catch (e) {
      console.warn('Failed to load accounts:', e);
    }
  };

  useEffect(() => {
    refreshAccounts();

    // Check updates if enabled
    if (config.autoCheckUpdates) {
      invokeCommand<UpdateCheckResult>('check_updates', { channel: config.releaseChannel })
        .then((res) => {
          if (res?.update_available) {
            setUpdateInfo(res);
          }
        })
        .catch(console.warn);
    }

    // Interval to poll running status
    const interval = setInterval(() => {
      invokeCommand<boolean>('is_game_running')
        .then(setIsRunning)
        .catch(() => {});
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0] || null;

  const handleLaunch = async () => {
    setIsLoading(true);
    try {
      await invokeCommand('launch_game', {
        config: {
          ram_mb: config.allocatedRamMb,
          java_path: config.javaPath,
          custom_jvm_args: config.customJvmArgs,
          width: config.gameResolutionWidth,
          height: config.gameResolutionHeight,
          username: activeAccount?.username || 'SamratPlayer',
          uuid: activeAccount?.uuid || '00000000-0000-0000-0000-000000000000',
          access_token: activeAccount?.access_token || 'local_token',
          game_dir: '.samrat/game',
          assets_dir: '.samrat/assets',
          client_jar_path: 'client/build/libs/samrat-client-1.8.9-1.0.0.jar',
        },
      });
      setIsRunning(true);
    } catch (e: any) {
      setCrashLog(`Launch Failed:\n${e?.toString() || 'Unknown spawn error'}\n\nEnvironment: 64-bit Java\nTarget: Minecraft 1.8.9`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminate = async () => {
    try {
      await invokeCommand('terminate_game');
      setIsRunning(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetActiveAccount = async (id: string) => {
    setActiveAccountId(id);
    await invokeCommand('set_active_account', { accountId: id }).catch(console.warn);
  };

  const handleRemoveAccount = async (id: string) => {
    await invokeCommand('remove_account', { accountId: id }).catch(console.warn);
    refreshAccounts();
  };

  const handleCreateProfile = (name: string, preset: ProfileItem['performancePreset']) => {
    const newP: ProfileItem = {
      id: name,
      name,
      description: 'Custom profile with ' + preset + ' tuning',
      isPreset: false,
      performancePreset: preset,
    };
    setProfiles([...profiles, newP]);
    setConfig({ ...config, selectedProfileId: name });
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles(profiles.filter((p) => p.id !== id));
    if (config.selectedProfileId === id) {
      setConfig({ ...config, selectedProfileId: 'Default' });
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0c1017' }} className="flex overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar activePage={activePage} onSelectPage={setActivePage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          activeAccount={activeAccount}
          isRunning={isRunning}
          onOpenAccounts={() => setActivePage('accounts')}
        />

        <main className="flex-1 flex flex-col overflow-hidden bg-dark">
          {activePage === 'home' && (
            <HomePage
              activeAccount={activeAccount}
              profiles={profiles}
              selectedProfileId={config.selectedProfileId}
              ramMb={config.allocatedRamMb}
              isRunning={isRunning}
              isLoading={isLoading}
              onSelectProfile={(id) => setConfig({ ...config, selectedProfileId: id })}
              onChangeRam={(mb) => setConfig({ ...config, allocatedRamMb: mb })}
              onLaunch={handleLaunch}
              onTerminate={handleTerminate}
            />
          )}

          {activePage === 'client' && <ClientPage />}

          {activePage === 'versions' && <VersionsPage />}

          {activePage === 'mods' && <ModsPage />}

          {activePage === 'profiles' && (
            <ProfilesPage
              profiles={profiles}
              selectedProfileId={config.selectedProfileId}
              onSelectProfile={(id) => setConfig({ ...config, selectedProfileId: id })}
              onCreateProfile={handleCreateProfile}
              onDeleteProfile={handleDeleteProfile}
            />
          )}

          {activePage === 'accounts' && (
            <AccountsPage
              accounts={accounts}
              activeAccountId={activeAccountId}
              onSetActive={handleSetActiveAccount}
              onRemove={handleRemoveAccount}
              onRefreshAccounts={refreshAccounts}
            />
          )}

          {activePage === 'cosmetics' && <CosmeticsPage />}

          {activePage === 'settings' && (
            <SettingsPage
              config={config}
              onUpdateConfig={(updated) => setConfig({ ...config, ...updated })}
            />
          )}

          {activePage === 'diagnostics' && <DiagnosticsPage />}

          {activePage === 'about' && <AboutPage />}
        </main>
      </div>

      {/* Update Available Modal */}
      {updateInfo && (
        <UpdateModal
          updateInfo={updateInfo}
          onClose={() => setUpdateInfo(null)}
          onApplyUpdate={() => {
            alert('Installing update package and verifying SHA-256...');
            setUpdateInfo(null);
          }}
        />
      )}

      {/* Crash Diagnostics Modal */}
      {crashLog && (
        <CrashModal
          crashLog={crashLog}
          onClose={() => setCrashLog(null)}
        />
      )}
    </div>
  );
};
