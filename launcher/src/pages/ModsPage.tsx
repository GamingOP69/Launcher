import React, { useState, useEffect } from 'react';
import { Package, FolderOpen, ShieldCheck, Download, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { invokeCommand, listenEvent } from '../services/tauriBridge';
import { ClientModuleInfo } from './ClientPage';

export interface CuratedMod {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: string;
  filename: string;
  installed: boolean;
  size_kb: number;
}

export const ModsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BUILTIN' | 'CATALOG'>('BUILTIN');
  const [addons, setAddons] = useState([
    {
      id: 'fastmath',
      moduleName: 'FastMath Tables',
      name: 'FastMath Native Acceleration',
      version: '1.0.0',
      author: 'Samrat Core',
      description: 'Replaces Math trig calls with precomputed 65,536-entry tables.',
      enabled: true,
      isCore: true,
    },
    {
      id: 'entitycull',
      moduleName: 'Entity & Tile Culling',
      name: 'Frustum Entity & Tile Culling',
      version: '1.0.0',
      author: 'Samrat Core',
      description: 'Skips rendering of unseen entities outside the camera view frustum.',
      enabled: true,
      isCore: true,
    },
    {
      id: 'bedwars_suite',
      moduleName: 'Bed Status Matrix',
      name: 'Bedwars 8-Team Matrix',
      version: '1.0.0',
      author: 'Samrat Core',
      description: 'Live bed destruction tracking and generator countdown timers.',
      enabled: true,
      isCore: true,
    },
    {
      id: 'zoom',
      moduleName: 'OptiFine Zoom',
      name: 'Cinematic Zoom (C Key)',
      version: '1.0.0',
      author: 'Samrat Core',
      description: 'Smooth FOV magnification and cinematic camera controls on C key.',
      enabled: true,
      isCore: true,
    },
    {
      id: 'low_fire',
      moduleName: 'Low Fire',
      name: 'Low Fire PvP Visibility',
      version: '1.0.0',
      author: 'Samrat Core',
      description: 'Lowers first-person fire rendering overlay during combat for clear sightlines.',
      enabled: true,
      isCore: true,
    },
    {
      id: 'old_anim',
      moduleName: '1.7 Old Animations',
      name: '1.7 Old Animations (Blockhit & Sword)',
      version: '1.0.0',
      author: 'Samrat Core',
      description: 'Restores classic 1.7 simultaneous block-hitting, bow, and rod animations.',
      enabled: true,
      isCore: true,
    },
    {
      id: 'custom_crosshairs',
      moduleName: 'Custom Crosshair',
      name: 'Vector Crosshair Customizer',
      version: '1.0.0',
      author: 'Samrat Core',
      description: 'Render custom geometric crosshair shapes with dynamic sprint spread.',
      enabled: true,
      isCore: false,
    },
  ]);

  const [curatedMods, setCuratedMods] = useState<CuratedMod[]>([]);
  const [downloadingMod, setDownloadingMod] = useState<string | null>(null);

  const fetchCatalog = () => {
    invokeCommand<CuratedMod[]>('get_curated_mods')
      .then((res) => {
        if (res && res.length > 0) {
          setCuratedMods(res);
        }
      })
      .catch(console.warn);
  };

  useEffect(() => {
    invokeCommand<ClientModuleInfo[]>('get_client_modules')
      .then((modules) => {
        if (modules && modules.length > 0) {
          setAddons((prev) =>
            prev.map((addon) => {
              const matched = modules.find((m) => m.name === addon.moduleName);
              return matched ? { ...addon, enabled: matched.enabled } : addon;
            })
          );
        }
      })
      .catch(console.warn);

    fetchCatalog();
  }, []);

  const handleDownloadMod = async (mod: CuratedMod) => {
    setDownloadingMod(mod.id);
    try {
      await invokeCommand('download_curated_mod', {
        modId: mod.id,
      });
      fetchCatalog();
    } catch (e: any) {
      alert(`Download failed: ${e?.toString() || 'Network error'}`);
    } finally {
      setDownloadingMod(null);
    }
  };

  const handleDeleteMod = async (filename: string) => {
    try {
      await invokeCommand('delete_mod_file', { filename });
      fetchCatalog();
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenModsFolder = () => {
    invokeCommand('open_folder', { folderType: 'mods' }).catch(console.warn);
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto text-left w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white tracking-wide">MODS & CLIENT ADDONS</h2>
          <p className="text-xs text-gray-400">
            Module controls are preview-only until the Minecraft integration is connected. Add-on downloads require a verified catalog.
          </p>
        </div>

        <button
          onClick={handleOpenModsFolder}
          className="flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold text-gray-300 bg-[#141824] border border-white/[0.08] hover:border-cyan-500/40 hover:text-white transition-colors cursor-pointer"
        >
          <FolderOpen size={14} className="text-cyan-400" />
          <span>Open Mods Folder</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.07] pb-3">
        <button
          onClick={() => setActiveTab('BUILTIN')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'BUILTIN'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
          }`}
        >
          Built-in Engine Modules ({addons.length})
        </button>

        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'CATALOG'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
          }`}
        >
          Add-on Catalog (disabled)
        </button>
      </div>

      {activeTab === 'BUILTIN' ? (
        <>
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
            <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
            <span>These descriptions are preview content. No module is connected to Minecraft or approved by a server.</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {addons.map((mod) => (
              <div
                key={mod.id}
                className="p-4 rounded-xl flex items-center justify-between transition-all border bg-[#121622] border-white/[0.08] shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-lg border bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
                    <Package size={17} />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{mod.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                        v{mod.version}
                      </span>
                      {mod.isCore && (
                        <span className="text-[9px] bg-white/[0.06] text-gray-300 font-bold px-1.5 py-0.5 rounded uppercase">
                          CORE
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 mt-0.5">{mod.description}</span>
                  </div>
                </div>

                <span className="text-[9px] font-bold text-gray-500 bg-[#1c2233] border border-white/[0.08] px-2 py-1 rounded uppercase">
                  Preview
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="text-xs text-gray-400 bg-[#121622] p-3 rounded-xl border border-white/[0.08]">
            Add-on downloads are disabled until each artifact has a reviewed source, checksum, size limit, and Minecraft compatibility record.
          </div>

          {curatedMods.length === 0 && (
            <div className="text-xs text-gray-400 bg-[#121622] p-4 rounded-xl border border-white/[0.08]">
              No verified add-ons are currently available.
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {curatedMods.map((mod) => (
              <div
                key={mod.id}
                className="p-4 rounded-xl flex items-center justify-between transition-all bg-[#121622] border border-white/[0.08] shadow-sm"
              >
                <div className="flex items-center gap-3.5 max-w-[70%]">
                  <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex-shrink-0">
                    <Package size={17} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{mod.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                        v{mod.version}
                      </span>
                      <span className="text-[9px] bg-white/[0.06] text-gray-400 font-medium px-1.5 py-0.5 rounded">
                        {mod.category}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{mod.description}</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      Author: {mod.author} • {mod.size_kb} KB
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {mod.installed ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 size={13} /> Installed
                      </span>
                      <button
                        onClick={() => handleDeleteMod(mod.filename)}
                        className="p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Mod File"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : downloadingMod === mod.id ? (
                    <button
                      disabled
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-400 bg-[#181d2c] border border-cyan-500/30 opacity-80 cursor-not-allowed"
                    >
                      <Loader2 size={13} className="animate-spin" />
                      <span>Downloading...</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownloadMod(mod)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-colors cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
