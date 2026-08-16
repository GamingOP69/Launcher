import React, { useState } from 'react';
import { Package, FolderOpen, Power, ShieldCheck } from 'lucide-react';
import { invokeCommand } from '../services/tauriBridge';

export const ModsPage: React.FC = () => {
  const [mods, setMods] = useState([
    {
      id: 'fastmath',
      name: 'FastMath Native Acceleration',
      version: '1.0.0',
      author: 'Samrat Core',
      description: 'Replaces standard Math trigonometric calls with precomputed 65,536-entry lookup tables.',
      enabled: true,
      isCore: true,
    },
    {
      id: 'entitycull',
      name: 'Frustum Entity & Tile Culling',
      version: '1.0.0',
      author: 'Samrat Core',
      description: 'Skips rendering of unseen entities and chests outside the camera view frustum.',
      enabled: true,
      isCore: true,
    },
    {
      id: 'bedwars_suite',
      name: 'Bedwars 8-Team Informational Matrix',
      version: '1.0.0',
      author: 'Samrat Core',
      description: 'Live bed destruction tracking and generator countdown timers.',
      enabled: true,
      isCore: true,
    },
    {
      id: 'optifine_compat',
      name: 'OptiFine & Shaderpack Compatibility Layer',
      version: '1.8.9-HD-U-M5',
      author: 'sp614x / Samrat Bridge',
      description: 'Enables custom skyboxes, connected textures, and shaderpack pipeline integration.',
      enabled: true,
      isCore: false,
    },
    {
      id: 'custom_crosshairs',
      name: 'Vector Crosshair Customizer',
      version: '1.0.0',
      author: 'Samrat Core',
      description: 'Render custom geometric crosshair shapes with dynamic sprint spread.',
      enabled: true,
      isCore: false,
    },
  ]);

  const toggleMod = (id: string) => {
    setMods(mods.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  const handleOpenModsFolder = () => {
    invokeCommand('open_folder', { folderType: 'mods' }).catch(console.warn);
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto text-left w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black text-white tracking-wide">MODS & CLIENT ADDONS</h2>
          <p className="text-xs text-slate-400">Configure built-in client modules and standalone 1.8.9 Forge addons.</p>
        </div>

        <button
          onClick={handleOpenModsFolder}
          className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 transition-all duration-150 cursor-pointer shadow-sm"
        >
          <FolderOpen size={15} className="text-cyan-400" />
          <span>Open Mods Folder</span>
        </button>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
        <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
        <span>All built-in client addons are verified and conform strictly to server anti-cheat standards.</span>
      </div>

      <div className="flex flex-col gap-3">
        {mods.map((mod) => (
          <div
            key={mod.id}
            className={`p-5 rounded-2xl flex items-center justify-between transition-all duration-150 border ${
              mod.enabled 
                ? 'bg-slate-900/90 border-slate-800 shadow-sm' 
                : 'bg-slate-950/60 border-slate-900 opacity-60'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl border ${
                mod.enabled ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                <Package size={18} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{mod.name}</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                    v{mod.version}
                  </span>
                  {mod.isCore && (
                    <span className="text-[9px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded uppercase">
                      CORE ENGINE
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 mt-0.5">{mod.description}</span>
                <span className="text-[10px] text-slate-400 mt-1">Author: {mod.author}</span>
              </div>
            </div>

            <button
              onClick={() => toggleMod(mod.id)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                mod.enabled 
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={mod.enabled ? 'Disable Mod' : 'Enable Mod'}
            >
              <Power size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
