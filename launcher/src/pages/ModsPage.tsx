import React, { useState } from 'react';
import { Package, FolderOpen, Check, Power, AlertCircle, ShieldCheck } from 'lucide-react';

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

  return (
    <div style={{ padding: '24px', gap: '20px' }} className="flex flex-col flex-1 overflow-y-auto text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>MODS & CLIENT ADDONS</h2>
          <p style={{ fontSize: '12px', color: '#8fa2b7' }}>Configure built-in client modules and standalone 1.8.9 Forge addons.</p>
        </div>

        <button
          onClick={() => alert('Opened .samrat/mods directory')}
          style={{ backgroundColor: '#1c2433', color: '#ffffff', border: '1px solid #222e3f', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
          className="flex items-center gap-2 hover:bg-surface-hover cursor-pointer"
        >
          <FolderOpen size={15} style={{ color: '#00f0ff' }} />
          <span>Open Mods Folder</span>
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-white bg-surface p-3 rounded-lg border border-subtle">
        <ShieldCheck size={16} style={{ color: '#00e676', flexShrink: 0 }} />
        <span>All built-in client addons are verified and conform strictly to server anti-cheat standards.</span>
      </div>

      <div className="flex flex-col gap-3">
        {mods.map((mod) => (
          <div
            key={mod.id}
            style={{
              backgroundColor: mod.enabled ? '#141a24' : '#0c1017',
              border: mod.enabled ? '1px solid #222e3f' : '1px solid #1c2433',
              padding: '16px 20px',
              borderRadius: '10px',
              opacity: mod.enabled ? 1 : 0.6,
            }}
            className="flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: mod.enabled ? '#1c2433' : '#141a24' }}>
                <Package size={18} style={{ color: mod.enabled ? '#00f0ff' : '#586b7f' }} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{mod.name}</span>
                  <span style={{ fontSize: '10px', backgroundColor: '#0c1017', color: '#a0c8ff', padding: '2px 6px', borderRadius: '4px' }} className="font-mono">
                    v{mod.version}
                  </span>
                  {mod.isCore && (
                    <span style={{ fontSize: '9px', backgroundColor: '#00f0ff', color: '#0c1017', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                      CORE
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: '#8fa2b7', marginTop: '2px' }}>{mod.description}</span>
              </div>
            </div>

            <button
              onClick={() => toggleMod(mod.id)}
              style={{
                backgroundColor: mod.enabled ? '#00f0ff' : '#242e40',
                color: mod.enabled ? '#0c1017' : '#ffffff',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
              }}
              className="flex items-center gap-1.5 cursor-pointer glow-cyan-hover"
            >
              <Power size={13} />
              <span>{mod.enabled ? 'ENABLED' : 'DISABLED'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
