import React, { useState, useEffect } from 'react';
import { Sidebar, PageId } from './components/Sidebar';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ClientPage } from './pages/ClientPage';
import { VersionsPage } from './pages/VersionsPage';
import { ModsPage } from './pages/ModsPage';
import { ProfilesPage } from './pages/ProfilesPage';
import { AccountsPage } from './pages/AccountsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { AboutPage } from './pages/AboutPage';
import { CrashModal } from './components/CrashModal';
import { AuthAccount, AccountStorage } from './types/account';
import { ProfileItem } from './types/profile';
import { LauncherConfig, DEFAULT_LAUNCHER_CONFIG } from './types/config';
import { invokeCommand } from './services/tauriBridge';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [accounts, setAccounts] = useState<AuthAccount[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | undefined>();
  const [profiles, setProfiles] = useState<ProfileItem[]>([
    {
      id: 'Default',
      name: 'Default',
      description: 'Standard balanced client configuration',
      isPreset: true,
      performancePreset: 'BALANCED',
    },
    {
      id: 'Bedwars',
      name: 'Bedwars',
      description: 'Optimized HUD, team trackers and resource timers',
      isPreset: true,
      performancePreset: 'BALANCED',
    },
    {
      id: 'PvP',
      name: 'PvP',
      description: 'Aggressive combo tracking and custom crosshair',
      isPreset: true,
      performancePreset: 'HIGH_FPS',
    },
    {
      id: 'FPS',
      name: 'FPS Boost',
      description: 'Maximum framerate tuning with aggressive culling',
      isPreset: true,
      performancePreset: 'HIGH_FPS',
    },
  ]);
  const [config, setConfig] = useState<LauncherConfig>(DEFAULT_LAUNCHER_CONFIG);

  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientInstalled, setClientInstalled] = useState<boolean | null>(null);
  const [crashLog, setCrashLog] = useState<string | null>(null);

  const refreshAccounts = async () => {
    try {
      const storage = await invokeCommand<AccountStorage>('get_accounts');
      if (storage?.accounts && storage.accounts.length > 0) {
        setAccounts(storage.accounts);
        setActiveAccountId(storage.active_account_id || storage.accounts[0]?.id);
      } else {
        const defaultAcc = await invokeCommand<AuthAccount>('add_offline_account', {
          username: 'SamratPlayer',
          skinType: 'steve',
        });
        setAccounts([defaultAcc]);
        setActiveAccountId(defaultAcc.id);
      }
    } catch (e) {
      console.warn('Failed to load accounts:', e);
    }
  };

  const refreshProfiles = async () => {
    try {
      const saved = await invokeCommand<
        { id: string; name: string; description: string; is_preset: boolean; performance_preset: string }[]
      >('get_saved_profiles');
      if (saved && saved.length > 0) {
        setProfiles(
          saved.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            isPreset: p.is_preset,
            performancePreset: p.performance_preset as ProfileItem['performancePreset'],
          }))
        );
      }
    } catch (e) {
      console.warn('Failed to load profiles:', e);
    }
  };

  const checkClientInstalled = async () => {
    try {
      const status = await invokeCommand<{ installed: boolean }>('check_client_installed');
      setClientInstalled(status.installed);
    } catch {
      setClientInstalled(false);
    }
  };

  useEffect(() => {
    refreshAccounts();
    refreshProfiles();
    checkClientInstalled();

    const interval = setInterval(() => {
      invokeCommand<boolean>('is_game_running')
        .then(setIsRunning)
        .catch(() => {});
    }, 1500);

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
          uuid: activeAccount?.uuid || 'c06f8906-4c8a-4911-9c29-ea1db5022e33',
          access_token: activeAccount?.access_token || 'offline_token',
          game_dir: '.samrat/game',
          assets_dir: '.samrat/assets',
          client_jar_path: '',
        },
      });
      setIsRunning(true);
      setClientInstalled(true);
    } catch (e: any) {
      const errStr = e?.toString() || 'Launch failed. Please verify Java runtime is installed.';
      setCrashLog(errStr);
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
    setProfiles((prev) => [...prev, newP]);
    setConfig({ ...config, selectedProfileId: name });
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (config.selectedProfileId === id) {
      setConfig({ ...config, selectedProfileId: 'Default' });
    }
  };

  return (
    <div className="w-screen h-screen bg-[#0a0c12] flex overflow-hidden text-gray-100 font-sans select-none antialiased">
      {/* Sidebar Navigation */}
      <Sidebar activePage={activePage} onSelectPage={setActivePage} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090b10] min-w-0">
        <Header
          activeAccount={activeAccount}
          isRunning={isRunning}
          onOpenAccounts={() => setActivePage('accounts')}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative min-h-0">
          {activePage === 'home' && (
            <HomePage
              activeAccount={activeAccount}
              profiles={profiles}
              selectedProfileId={config.selectedProfileId}
              ramMb={config.allocatedRamMb}
              isRunning={isRunning}
              isLoading={isLoading}
              clientInstalled={clientInstalled}
              onClientInstalled={() => setClientInstalled(true)}
              onSelectProfile={(id) => setConfig({ ...config, selectedProfileId: id })}
              onChangeRam={(mb) => setConfig({ ...config, allocatedRamMb: mb })}
              onLaunch={handleLaunch}
              onTerminate={handleTerminate}
              onOpenAccounts={() => setActivePage('accounts')}
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

      {/* Crash / Error Diagnostics Modal */}
      {crashLog && <CrashModal crashLog={crashLog} onClose={() => setCrashLog(null)} />}
    </div>
  );
};
