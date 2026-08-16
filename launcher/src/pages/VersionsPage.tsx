import React from 'react';
import { GitBranch, CheckCircle2, FolderOpen, Tag, Clock, ShieldCheck, Cpu } from 'lucide-react';
import { invokeCommand } from '../services/tauriBridge';

export const VersionsPage: React.FC = () => {
  const handleOpenFolder = () => {
    invokeCommand('open_folder', { folderType: 'game' }).catch(console.warn);
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto text-left w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black text-white tracking-wide">CLIENT VERSIONS & BUILDS</h2>
          <p className="text-xs text-slate-400">Inspect installed client builds, target runtime versions, and file integrity.</p>
        </div>

        <button
          onClick={handleOpenFolder}
          className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 transition-all duration-150 cursor-pointer shadow-sm"
        >
          <FolderOpen size={15} className="text-cyan-400" />
          <span>Open Game Folder</span>
        </button>
      </div>

      <div className="flex flex-col gap-3.5">
        {/* Active Official Version Card */}
        <div className="bg-slate-900/90 border border-cyan-500/40 p-6 rounded-2xl flex flex-col gap-4 shadow-lg shadow-cyan-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <Tag size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-extrabold text-white">Samrat Client 1.8.9 Official Release</h3>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                    v1.0.0
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <Clock size={13} />
                  <span>Production Stable Build</span>
                  <span>•</span>
                  <span>Target: Minecraft 1.8.9 (Java 8 Bytecode)</span>
                </div>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl">
              <CheckCircle2 size={14} /> Installed & Ready
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/60 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-400 text-[10px] font-medium uppercase">Main Bootstrap Class</span>
              <span className="font-mono text-slate-200 font-semibold">com.samrat.SamratClient</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-400 text-[10px] font-medium uppercase">Minecraft 1.8.9 Tweaker</span>
              <span className="font-mono text-slate-200 font-semibold">SamratTweaker</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-400 text-[10px] font-medium uppercase">Anti-Cheat Mode</span>
              <span className="font-mono text-emerald-400 font-semibold">Strict Legitimate / Zero Hack</span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Engine Capabilities Included:</span>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-cyan-400" />
                <span>FastMath 65,536-entry trigonometric lookup tables</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-cyan-400" />
                <span>Frustum Entity & Tile Culling optimizer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-cyan-400" />
                <span>Bedwars 8-team status & generator countdown matrix</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-cyan-400" />
                <span>Interactive HUD SnapEngine with Right-Shift ClickGUI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
