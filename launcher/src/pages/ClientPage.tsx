import React, { useState, useEffect } from 'react';
import { Search, Power, Check } from 'lucide-react';
import { invokeCommand } from '../services/tauriBridge';

export interface ClientModuleInfo {
  id: string;
  name: string;
  category: 'HUD' | 'Bedwars' | 'PvP' | 'Performance' | 'Visual' | 'Player';
  description: string;
  enabled: boolean;
}

export const ClientPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [modules, setModules] = useState<ClientModuleInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModules = async () => {
    try {
      const data = await invokeCommand<ClientModuleInfo[]>('get_client_modules');
      if (data && data.length > 0) {
        setModules(data);
      }
    } catch (e) {
      console.warn('Failed to load modules from config:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const toggleModule = async (name: string, currentEnabled: boolean) => {
    const nextState = !currentEnabled;
    setModules((prev) =>
      prev.map((m) => (m.name === name ? { ...m, enabled: nextState } : m))
    );

    try {
      await invokeCommand('toggle_client_module', {
        moduleName: name,
        enabled: nextState,
      });
    } catch (e) {
      console.error('Failed to toggle module:', e);
    }
  };

  const categories = ['ALL', 'HUD', 'Bedwars', 'PvP', 'Performance', 'Visual', 'Player'];

  const filtered = modules.filter((m) => {
    const matchesTab = activeTab === 'ALL' || m.category === activeTab;
    const matchesSearch =
      searchQuery === '' ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto text-left w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white tracking-wide">CLIENT MODULES</h2>
          <p className="text-xs text-gray-400">
            Configure built-in informational HUD, Bedwars, and performance modules. In-game menu:{' '}
            <span className="text-cyan-400 font-mono font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded">
              [RIGHT SHIFT]
            </span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#121622] border border-white/[0.08] focus:border-cyan-500/40 text-white pl-8 pr-3.5 py-2 rounded-lg text-xs outline-none w-52"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 bg-[#121622] border border-white/[0.08] p-1 rounded-lg w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Module Cards Grid */}
      {loading ? (
        <div className="text-xs text-gray-500 py-8 text-center">Loading client modules...</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((mod) => (
            <div
              key={mod.id || mod.name}
              className={`p-4 rounded-xl flex items-center justify-between transition-all border ${
                mod.enabled
                  ? 'bg-[#131724] border-white/[0.08] shadow-sm'
                  : 'bg-[#0f121a] border-white/[0.04] opacity-50'
              }`}
            >
              <div className="flex flex-col gap-1 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{mod.name}</span>
                  <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded uppercase">
                    {mod.category}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 leading-snug">{mod.description}</span>
              </div>

              <button
                onClick={() => toggleModule(mod.name, mod.enabled)}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  mod.enabled
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                    : 'bg-[#1c2233] border-white/[0.08] text-gray-400 hover:text-gray-200'
                }`}
                title={mod.enabled ? 'Disable Module' : 'Enable Module'}
              >
                <Power size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
