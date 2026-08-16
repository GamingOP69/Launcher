import React from 'react';
import { Sparkles, Cpu, Crosshair, Bed, Eye, User, Compass, Wrench, CheckCircle } from 'lucide-react';

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
    <div style={{ padding: '24px', gap: '20px' }} className="flex flex-col flex-1 overflow-y-auto text-left">
      <div className="flex flex-col gap-1">
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>SAMRAT CLIENT 1.8.9 ECOSYSTEM</h2>
        <p style={{ fontSize: '12px', color: '#8fa2b7' }}>
          Explore all bundled informational modules and performance systems. Open in-game with <span style={{ color: '#00f0ff', fontWeight: 700 }}>[RIGHT SHIFT]</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <div
              key={index}
              style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '16px', borderRadius: '12px' }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: '#1c2433' }}>
                  <Icon size={16} style={{ color: '#00f0ff' }} />
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{cat.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {cat.modules.map((mod, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-secondary">
                    <CheckCircle size={12} style={{ color: '#00e676', flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: '#ffffff' }}>{mod}</span>
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
