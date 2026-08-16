import React from 'react';
import { Github, Shield, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto text-left w-full">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-slate-950 text-2xl shadow-xl shadow-cyan-500/20">
          S
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide">SAMRAT CLIENT</h2>
          <p className="text-xs font-semibold text-cyan-400">Next-Generation Minecraft 1.8.9 Desktop Ecosystem</p>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col gap-3.5 shadow-sm">
        <h3 className="text-sm font-bold text-white">Project Mission & Architecture</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Samrat Client is an unofficial, legitimate third-party client and launcher engineered specifically for competitive Bedwars and PvP enthusiasts.
          Built with an emphasis on zero local developer toolchain requirements, strict security, zero token leakage, and measurable rendering performance.
        </p>

        <div className="flex items-center gap-2 mt-2 text-xs text-slate-200 font-medium">
          <Shield size={14} className="text-emerald-400" />
          <span>Licensed under the MIT License • Built with Rust, Tauri v2, React 18, and Java 8</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <a
          href="https://github.com/GamingOP69/Launcher"
          target="_blank"
          rel="noreferrer"
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-5 rounded-2xl flex items-center gap-3.5 transition-all duration-150 shadow-sm group"
        >
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
            <Github size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">GitHub Repository</span>
            <span className="text-xs text-slate-400">Source code, CI/CD pipelines & releases</span>
          </div>
        </a>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Heart size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">Crafted for Creators</span>
            <span className="text-xs text-slate-400">100% Free & Open Source</span>
          </div>
        </div>
      </div>
    </div>
  );
};
