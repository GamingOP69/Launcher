import React from 'react';
import { Tag, Clock, FolderOpen, AlertCircle } from 'lucide-react';
import { invokeCommand } from '../services/tauriBridge';

export const VersionsPage: React.FC = () => {
  const handleOpenFolder = () => {
    invokeCommand('open_folder', { folderType: 'game' }).catch(console.warn);
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto text-left w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white tracking-wide">CLIENT VERSIONS & BUILDS</h2>
          <p className="text-xs text-gray-400">
            The launcher installs Minecraft 1.8.9 and prepares the pinned Forge runtime. The packaged Forge launch is awaiting CI verification.
          </p>
        </div>

        <button
          onClick={handleOpenFolder}
          className="flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold text-gray-300 bg-[#141824] border border-white/[0.08] hover:border-cyan-500/40 hover:text-white transition-colors cursor-pointer"
        >
          <FolderOpen size={14} className="text-cyan-400" />
          <span>Open Game Folder</span>
        </button>
      </div>

      {/* Active Version Card */}
      <div className="bg-[#121622] border border-white/[0.08] p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Tag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Minecraft Java Runtime</h3>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                  Forge runtime
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <Clock size={12} />
                <span>Forge 11.15.1.2318</span>
                <span>•</span>
                <span>Target: Minecraft Java 1.8.9</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
              <AlertCircle size={13} /> PvP features not integrated
            </span>
          </div>
        </div>

        {/* Technical specs */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.06] text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-500 text-[10px] uppercase font-semibold">Launch target</span>
            <span className="font-mono text-gray-300">Java process launcher</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-500 text-[10px] uppercase font-semibold">Game Integration</span>
              <span className="font-mono text-gray-300">Minecraft 1.8.9 + Forge</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-500 text-[10px] uppercase font-semibold">Verified Features</span>
            <span className="text-gray-300 font-semibold">No Samrat QoL features yet</span>
          </div>
        </div>

        {/* Download / Reinstall Action */}
        <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-300">Client Installation</span>
            <span className="text-[11px] text-gray-500">Home installs base Minecraft files. Forge libraries and the bundled Samrat mod are prepared during launch. Local profiles are offline-only.</span>
          </div>

          <span className="text-xs font-semibold text-gray-500 bg-[#1a1f2b] px-4 py-2 rounded-lg">Home installation action</span>
        </div>
      </div>
    </div>
  );
};
