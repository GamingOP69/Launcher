import React from 'react';
import { Github, Shield, Heart, ExternalLink } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto text-left w-full">
      {/* Header Banner */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-black text-xl shadow-sm">
          S
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">SAMRAT CLIENT</h2>
          <p className="text-xs text-cyan-400">Competitive Minecraft 1.8.9 Desktop Launcher</p>
        </div>
      </div>

      <div className="bg-[#121622] border border-white/[0.08] p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Architecture & Goals
        </h3>
        <p className="text-xs text-gray-300 leading-relaxed">
          Samrat Client is an unofficial, legitimate PvP and Bedwars client ecosystem. It features
          native trigonometric precomputed FastMath tables, HUD customization with SnapEngine, and
          an offline-first account manager.
        </p>

        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <Shield size={13} className="text-emerald-400" />
          <span>MIT License • Built with Rust, Tauri v2, React 18, and Java 8/17/21</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <a
          href="https://github.com/GamingOP69/Launcher"
          target="_blank"
          rel="noreferrer"
          className="bg-[#121622] hover:bg-[#161c2b] border border-white/[0.08] hover:border-cyan-500/40 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Github size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                GitHub Repository
              </span>
              <span className="text-[11px] text-gray-400">Source code, CI workflows & releases</span>
            </div>
          </div>
          <ExternalLink size={14} className="text-gray-500 group-hover:text-cyan-400" />
        </a>

        <div className="bg-[#121622] border border-white/[0.08] p-4 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Heart size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Open Source & Free</span>
            <span className="text-[11px] text-gray-400">Created for the community</span>
          </div>
        </div>
      </div>
    </div>
  );
};
