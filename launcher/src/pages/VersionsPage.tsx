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
            Minecraft client installation is disabled until a real integration and verified package are available.
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
                <h3 className="text-sm font-bold text-white">Samrat 1.8.9 Client Integration</h3>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                  Not available
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <Clock size={12} />
                <span>Development preview</span>
                <span>•</span>
                <span>Target: Minecraft Java 1.8.9</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
              <AlertCircle size={13} /> Not integrated
            </span>
          </div>
        </div>

        {/* Technical specs */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.06] text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-500 text-[10px] uppercase font-semibold">Java Preview</span>
            <span className="font-mono text-gray-300">Swing window only</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-500 text-[10px] uppercase font-semibold">Game Integration</span>
            <span className="font-mono text-gray-300">Not connected</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-500 text-[10px] uppercase font-semibold">Verified Features</span>
            <span className="text-gray-300 font-semibold">None yet</span>
          </div>
        </div>

        {/* Download / Reinstall Action */}
        <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-300">Client Installation</span>
            <span className="text-[11px] text-gray-500">No verified Minecraft client package is available.</span>
          </div>

          <span className="text-xs font-semibold text-gray-500 bg-[#1a1f2b] px-4 py-2 rounded-lg">Unavailable</span>
        </div>
      </div>
    </div>
  );
};
