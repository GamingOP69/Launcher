import React from 'react';
import { ShieldCheck, Zap, FolderOpen, HardDrive, Sparkles, Terminal, FileText, CheckCircle2 } from 'lucide-react';
import { invokeCommand } from '../services/tauriBridge';

export const NewsFeed: React.FC = () => {
  const handleOpenFolder = (folderType: string) => {
    invokeCommand('open_folder', { folderType }).catch(console.warn);
  };

  return (
    <div className="flex flex-col gap-3 text-left w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sparkles size={14} className="text-cyan-400" />
          <span>Ecosystem Telemetry & Quick Access</span>
        </h3>
        <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
          <CheckCircle2 size={12} />
          <span>Client Engine Ready</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3.5">
        {/* Card 1: Performance Tuning */}
        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl flex flex-col gap-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded uppercase">
              PERFORMANCE
            </span>
            <span className="text-[10px] text-slate-400 font-mono">1.8.9</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Zap size={13} className="text-cyan-400" />
            </div>
            <h4 className="text-xs font-bold text-white">FastMath & G1GC Active</h4>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Precomputed 65,536-entry trigonometry lookup tables and G1GC low-pause garbage collection tuned for zero input lag.
          </p>
        </div>

        {/* Card 2: Security & Integrity */}
        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl flex flex-col gap-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
              SECURITY
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">VERIFIED</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={13} className="text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-white">Anti-Cheat Safe & Pure Offline</h4>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            100% legitimate informational utilities. No unfair hacks, zero credential logging, and seamless local player management.
          </p>
        </div>

        {/* Card 3: Storage & Quick Folder Shortcuts */}
        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl flex flex-col gap-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
              EXPLORER
            </span>
            <span className="text-[10px] text-slate-400 font-mono">.samrat</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <FolderOpen size={13} className="text-amber-400" />
            </div>
            <h4 className="text-xs font-bold text-white">Data Directories</h4>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-auto">
            <button
              onClick={() => handleOpenFolder('mods')}
              className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-lg text-[10px] font-semibold text-slate-300 transition-colors flex items-center gap-1 justify-center cursor-pointer"
            >
              <FolderOpen size={11} className="text-cyan-400" />
              <span>Mods</span>
            </button>
            <button
              onClick={() => handleOpenFolder('logs')}
              className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-lg text-[10px] font-semibold text-slate-300 transition-colors flex items-center gap-1 justify-center cursor-pointer"
            >
              <Terminal size={11} className="text-emerald-400" />
              <span>Logs</span>
            </button>
            <button
              onClick={() => handleOpenFolder('profiles')}
              className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-lg text-[10px] font-semibold text-slate-300 transition-colors flex items-center gap-1 justify-center cursor-pointer"
            >
              <FileText size={11} className="text-amber-400" />
              <span>Profiles</span>
            </button>
            <button
              onClick={() => handleOpenFolder('')}
              className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-lg text-[10px] font-semibold text-slate-300 transition-colors flex items-center gap-1 justify-center cursor-pointer"
            >
              <HardDrive size={11} className="text-slate-400" />
              <span>Root</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
