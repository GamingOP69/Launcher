import React, { useState } from 'react';
import { Sparkles, Cpu, Crosshair, Bed, Eye, User, Search, Check, Power, Sliders } from 'lucide-react';

interface ClientModuleInfo {
  id: string;
  name: string;
  category: 'HUD' | 'Bedwars' | 'PvP' | 'Performance' | 'Visual' | 'Player';
  description: string;
  enabled: boolean;
}

export const ClientPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [modules, setModules] = useState<ClientModuleInfo[]>([
    // HUD
    { id: 'fps', name: 'FPS & 1% Lows', category: 'HUD', description: 'Real-time framerate and frame pacing jitter monitor', enabled: true },
    { id: 'cps', name: 'CPS Counter (LMB/RMB)', category: 'HUD', description: 'Accurate click-per-second tracker for left and right mouse buttons', enabled: true },
    { id: 'ping', name: 'Ping & Latency Display', category: 'HUD', description: 'Server round-trip latency and network jitter tracker', enabled: true },
    { id: 'keystrokes', name: 'Keystrokes (WASD + Space)', category: 'HUD', description: 'Visual overlay for WASD keys, Space, and mouse clicks', enabled: true },
    { id: 'armor', name: 'Armor & Equipment Status', category: 'HUD', description: 'Displays armor durability percentages and held item stats', enabled: true },
    { id: 'potions', name: 'Potion Timers HUD', category: 'HUD', description: 'Compact potion duration and amplifier status list', enabled: true },
    { id: 'coords', name: 'Coordinates & Biome', category: 'HUD', description: 'Precise XYZ player position and current biome display', enabled: true },
    { id: 'clock', name: 'Clock & Session Time', category: 'HUD', description: 'Real-world time and active play session duration', enabled: true },
    // Bedwars
    { id: 'bed_matrix', name: '8-Team Bed Status Matrix', category: 'Bedwars', description: 'Live tracking of all 8 team beds and alive player counts', enabled: true },
    { id: 'res_timers', name: 'Diamond & Emerald Timers', category: 'Bedwars', description: 'Tier upgrade and resource generator countdown clocks', enabled: true },
    { id: 'height_alert', name: 'Build Height & Void Warning', category: 'Bedwars', description: 'Visual banner alert when nearing max height or void boundaries', enabled: true },
    { id: 'team_status', name: 'Team Player Counter', category: 'Bedwars', description: 'Shows remaining active opponents and final kill tracker', enabled: true },
    // PvP
    { id: 'combo', name: 'Combo Streak Counter', category: 'PvP', description: 'Consecutive hit tracking without resetting damage ticks', enabled: true },
    { id: 'crosshair', name: 'Vector Custom Crosshair', category: 'PvP', description: 'Customizable geometric crosshair shapes and dynamic spread', enabled: true },
    { id: 'hit_color', name: 'Hit Flash Color Modifier', category: 'PvP', description: 'Customizable entity damage flash color (RGB/Hex)', enabled: true },
    { id: 'reach_display', name: 'Legitimate Reach Display', category: 'PvP', description: 'Displays exact block distance of successful hits (Max 3.0 blocks)', enabled: true },
    { id: 'toggle_sprint', name: 'Toggle Sprint / Sneak Indicator', category: 'PvP', description: 'Displays persistent sprint state on HUD', enabled: true },
    // Performance
    { id: 'fastmath', name: 'FastMath Native Acceleration', category: 'Performance', description: 'Replaces Math trig calls with precomputed 65,536-entry tables', enabled: true },
    { id: 'culling', name: 'Frustum Entity & Tile Culling', category: 'Performance', description: 'Skips rendering entities and tiles outside camera frustum', enabled: true },
    { id: 'smart_anim', name: 'Smart Texture Animations', category: 'Performance', description: 'Pauses block texture animations when not visible on screen', enabled: true },
    { id: 'mem_optimizer', name: 'Memory Defragmenter', category: 'Performance', description: 'Periodic garbage collection optimization during idle menus', enabled: true },
    // Visual
    { id: 'motion_blur', name: 'Velocity Motion Blur', category: 'Visual', description: 'Camera velocity-based frame blending motion blur', enabled: false },
    { id: 'time_changer', name: 'Client World Time Changer', category: 'Visual', description: 'Allows locking client-side visual time to Day/Sunset/Night', enabled: false },
    { id: 'block_overlay', name: 'Block Selection Outline', category: 'Visual', description: 'Customizable block bounding box outline and fill color', enabled: true },
    { id: 'item_physics', name: '3D Dropped Item Physics', category: 'Visual', description: 'Realistic 3D physics rendering for dropped ground items', enabled: true },
    // Player
    { id: 'freelook', name: '360° Freelook Camera', category: 'Player', description: 'Enables 360-degree third-person camera rotation on key press', enabled: true },
    { id: 'auto_gg', name: 'Auto GG Responder', category: 'Player', description: 'Politely sends "gg" in chat upon game completion', enabled: true },
    { id: 'chat_mod', name: 'Chat Customizer & Stacking', category: 'Player', description: 'Compact message stacking and timestamp prefixes', enabled: true },
  ]);

  const toggleModule = (id: string) => {
    setModules(modules.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  const categories = ['ALL', 'HUD', 'Bedwars', 'PvP', 'Performance', 'Visual', 'Player'];

  const filtered = modules.filter((m) => {
    const matchesTab = activeTab === 'ALL' || m.category === activeTab;
    const matchesSearch = searchQuery === '' || 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto text-left w-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black text-white tracking-wide">CLIENT 1.8.9 MODULE SUITE</h2>
          <p className="text-xs text-slate-400">
            Configure built-in informational HUD, Bedwars, and performance modules. Open in-game with <span className="text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">[RIGHT SHIFT]</span>.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-800 focus:border-cyan-500/50 text-white pl-8 pr-3.5 py-2 rounded-xl text-xs outline-none w-56"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1 rounded-xl w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === cat
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {filtered.map((mod) => (
          <div
            key={mod.id}
            className={`p-4 rounded-2xl flex items-center justify-between transition-all duration-150 border ${
              mod.enabled
                ? 'bg-slate-900/90 border-slate-800 shadow-sm'
                : 'bg-slate-950/60 border-slate-900 opacity-60'
            }`}
          >
            <div className="flex flex-col gap-1 max-w-[80%]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{mod.name}</span>
                <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded uppercase">
                  {mod.category}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 leading-snug">{mod.description}</span>
            </div>

            <button
              onClick={() => toggleModule(mod.id)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                mod.enabled
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={mod.enabled ? 'Disable Module' : 'Enable Module'}
            >
              <Power size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
