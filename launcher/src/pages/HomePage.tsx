import React, { useState } from 'react';
import { AuthAccount } from '../types/account';
import { ProfileItem } from '../types/profile';
import { invokeCommand, listenEvent } from '../services/tauriBridge';
import {
  Play,
  Square,
  Download,
  Loader2,
  Zap,
  HardDrive,
  FolderOpen,
  CheckCircle2,
  FileText,
  User,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface HomePageProps {
  activeAccount: AuthAccount | null;
  profiles: ProfileItem[];
  selectedProfileId: string;
  ramMb: number;
  isRunning: boolean;
  isLoading: boolean;
  clientInstalled: boolean | null;
  onClientInstalled: () => void;
  onSelectProfile: (id: string) => void;
  onChangeRam: (mb: number) => void;
  onLaunch: () => void;
  onTerminate: () => void;
  onOpenAccounts?: () => void;
}

const RAM_STEPS = [1024, 2048, 3072, 4096, 6144, 8192];

export const HomePage: React.FC<HomePageProps> = ({
  activeAccount,
  profiles,
  selectedProfileId,
  ramMb,
  isRunning,
  isLoading,
  clientInstalled,
  onClientInstalled,
  onSelectProfile,
  onChangeRam,
  onLaunch,
  onTerminate,
}) => {
  const [installing, setInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installError, setInstallError] = useState<string | null>(null);

  const handleInstall = async () => {
    setInstalling(true);
    setInstallError(null);
    setInstallProgress(10);

    const unlisten = await listenEvent<{ stage: string; percent: number }>(
      'install_progress',
      ({ percent }) => setInstallProgress(percent)
    );

    try {
      await invokeCommand('download_client');
      setInstallProgress(100);
      onClientInstalled();
    } catch (e: any) {
      setInstallError(
        e?.toString() ||
          'Download failed. Please ensure you have internet access or build the JAR via CI.'
      );
    } finally {
      setInstalling(false);
      unlisten();
    }
  };

  const handleOpenFolder = (folderType: string) => {
    invokeCommand('open_folder', { folderType }).catch(console.warn);
  };

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto text-left w-full">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#121724] via-[#10141f] to-[#0c0f18] border border-white/[0.08] p-6 flex items-center justify-between shadow-lg relative overflow-hidden flex-shrink-0">
        <div className="flex flex-col gap-2 z-10 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Minecraft 1.8.9 Official Release
            </span>
            <span className="text-gray-400 text-xs font-semibold">v1.0.0</span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            SAMRAT <span className="text-cyan-400">CLIENT</span>
          </h2>

          <p className="text-xs text-gray-300 leading-relaxed">
            High-performance Bedwars & PvP client with native FastMath lookup tables, custom HUD
            SnapEngine, zero input latency, and Right-Shift ClickGUI.
          </p>

          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-300 font-medium">
              <Zap size={13} className="text-yellow-400" />
              <span>FastMath Acceleration</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-300 font-medium">
              <Sparkles size={13} className="text-cyan-400" />
              <span>Right-Shift In-Game GUI</span>
            </div>
          </div>
        </div>

        {/* Launch / Install Action Unit */}
        <div className="z-10 flex flex-col items-center gap-2.5 flex-shrink-0">
          {clientInstalled === false ? (
            <div className="flex flex-col items-center gap-2">
              {installError && (
                <span className="text-[11px] text-rose-400 max-w-[200px] text-center">
                  {installError}
                </span>
              )}
              {installing ? (
                <div className="flex flex-col items-center gap-2 w-44">
                  <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${installProgress}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono">
                    Downloading... {installProgress}%
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-xs tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  <Download size={16} />
                  <span>INSTALL CLIENT</span>
                </button>
              )}
              <span className="text-[11px] text-gray-400">Client JAR not downloaded</span>
            </div>
          ) : isLoading ? (
            <button
              disabled
              className="flex items-center gap-2.5 px-8 py-3 rounded-xl font-bold text-xs tracking-wider text-cyan-400 bg-[#151a26] border border-cyan-500/30 opacity-80 cursor-not-allowed"
            >
              <Loader2 size={16} className="animate-spin" />
              <span>LAUNCHING...</span>
            </button>
          ) : isRunning ? (
            <button
              onClick={onTerminate}
              className="flex items-center gap-2.5 px-8 py-3 rounded-xl font-bold text-xs tracking-wider text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <Square size={15} fill="currentColor" />
              <span>STOP CLIENT</span>
            </button>
          ) : (
            <button
              onClick={onLaunch}
              className="flex items-center gap-2.5 px-9 py-3 rounded-xl font-black text-xs tracking-widest text-black bg-cyan-400 hover:bg-cyan-300 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all cursor-pointer group"
            >
              <Play size={15} fill="black" className="transition-transform group-hover:scale-110" />
              <span>PLAY NOW</span>
            </button>
          )}

          <span className="text-[11px] font-medium text-gray-400">
            {isRunning
              ? 'Game is running'
              : clientInstalled
              ? 'Ready to launch'
              : 'One-click install available'}
          </span>
        </div>
      </div>

      {/* Profile & Memory Controls Grid */}
      <div className="grid grid-cols-2 gap-4 flex-shrink-0">
        {/* Profile Selector */}
        <div className="bg-[#121622] border border-white/[0.07] p-4 rounded-xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders size={13} className="text-cyan-400" />
              <span>Active Profile</span>
            </span>
            <span className="text-[11px] font-semibold text-cyan-400">{selectedProfile?.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {profiles.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectProfile(p.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left flex items-center justify-between cursor-pointer ${
                  selectedProfileId === p.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                    : 'bg-[#181d2c] hover:bg-[#1f2538] text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                <span>{p.name}</span>
                {selectedProfileId === p.id && <CheckCircle2 size={12} className="text-cyan-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Memory Slider */}
        <div className="bg-[#121622] border border-white/[0.07] p-4 rounded-xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive size={13} className="text-cyan-400" />
              <span>Allocated Memory</span>
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {ramMb >= 1024 ? `${ramMb / 1024} GB` : `${ramMb} MB`}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={RAM_STEPS.length - 1}
            step={1}
            value={Math.max(0, RAM_STEPS.indexOf(ramMb))}
            onChange={(e) => onChangeRam(RAM_STEPS[Number(e.target.value)])}
            className="w-full accent-cyan-400 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>1 GB</span>
            <span>2 GB</span>
            <span>3 GB</span>
            <span>4 GB</span>
            <span>6 GB</span>
            <span>8 GB</span>
          </div>
        </div>
      </div>

      {/* Telemetry & Quick Action Bar */}
      <div className="bg-[#121622] border border-white/[0.07] p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
              Current Player
            </span>
            <span className="text-gray-200 font-bold flex items-center gap-1">
              <User size={12} className="text-cyan-400" />
              {activeAccount?.username || 'Guest'}
            </span>
          </div>

          <div className="w-px h-7 bg-white/[0.07]" />

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
              Client JAR Status
            </span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                clientInstalled ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              <CheckCircle2 size={12} />
              {clientInstalled ? 'Installed & Ready' : 'Download Required'}
            </span>
          </div>

          <div className="w-px h-7 bg-white/[0.07]" />

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
              Anti-Cheat Engine
            </span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              100% Legitimate / Safe
            </span>
          </div>
        </div>

        {/* Quick Folder Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenFolder('mods')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181d2c] hover:bg-[#20273a] text-gray-300 hover:text-white text-xs font-medium transition-colors cursor-pointer border border-white/[0.05]"
          >
            <FolderOpen size={13} className="text-cyan-400" />
            <span>Mods Folder</span>
          </button>

          <button
            onClick={() => handleOpenFolder('logs')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181d2c] hover:bg-[#20273a] text-gray-300 hover:text-white text-xs font-medium transition-colors cursor-pointer border border-white/[0.05]"
          >
            <FileText size={13} className="text-cyan-400" />
            <span>Logs</span>
          </button>
        </div>
      </div>
    </div>
  );
};
