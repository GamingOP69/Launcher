import React from 'react';
import { Sparkles, Cpu, Crosshair, Bed, Eye, User, CheckCircle } from 'lucide-react';

export const ClientPage: React.FC = () => {
  const categories = [
    {
      title: 'HUD System',
      icon: Sparkles,
      modules: ['FPS & 1% Lows', 'CPS (LMB/RMB)', 'Ping & Latency', 'Keystrokes', 'Armor Status', 'Potion Timers', 'Coordinates', 'Clock & Session'],
    },
    {
      title: 'Bedwars Suite',
      icon: Bed,
      modules: ['8-Team Bed Status Matrix', 'Alive Players & Finals', 'Diamond / Emerald Tier Timers', 'Build Height & Void Warning Alert', 'Resource HUD'],
    },
    {
      title: 'PvP & Combat Info',
      icon: Crosshair,
      modules: ['Combo Streak Counter', 'Hit Flash Color Customizer', 'Dynamic Crosshairs', 'Toggle Sprint State Indicator', 'Legitimate Reach Display'],
    },
    {
      title: 'Performance Lab',
      icon: Cpu,
      modules: ['Precomputed FastMath Tables', 'Frustum Entity Culling', 'Particle Density Limiter', 'Memory Defragmentation', 'Smart Texture Animations'],
    },
    {
      title: 'Visual Enhancements',
      icon: Eye,
      modules: ['Velocity Motion Blur', 'Client-side World Time Changer', 'Block Overlay & Outline', 'Dropped Item Physics'],
    },
    {
      title: 'Player & Chat',
      icon: User,
      modules: ['360° Freelook Camera', 'Auto GG Polite Chat Responder', 'Chat Timestamps & Compact Stacking'],
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto text-left w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-white tracking-wide">SAMRAT CLIENT 1.8.9 ECOSYSTEM</h2>
        <p className="text-xs text-slate-400">
          Explore all bundled informational modules and performance systems. Open in-game with <span className="text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">[RIGHT SHIFT]</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <div
              key={index}
              className="bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 p-5 rounded-2xl flex flex-col gap-3.5 transition-all duration-150 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Icon size={16} />
                </div>
                <h3 className="text-sm font-bold text-white">{cat.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {cat.modules.map((mod, mIndex) => (
                  <div key={mIndex} className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/60 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-300">
                    <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{mod}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
