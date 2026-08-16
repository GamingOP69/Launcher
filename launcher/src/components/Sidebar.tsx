import React from 'react';
import {
  Play,
  Cpu,
  Layers,
  Users,
  Sliders,
  Activity,
  GitBranch,
  Package,
  Info,
  Shield,
} from 'lucide-react';

export type PageId =
  | 'home'
  | 'client'
  | 'versions'
  | 'mods'
  | 'profiles'
  | 'accounts'
  | 'settings'
  | 'diagnostics'
  | 'about';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
}

const navItems: { id: PageId; label: string; Icon: React.ElementType }[] = [
  { id: 'home', label: 'Play', Icon: Play },
  { id: 'client', label: 'Client Modules', Icon: Cpu },
  { id: 'versions', label: 'Versions & JAR', Icon: GitBranch },
  { id: 'mods', label: 'Mods & Addons', Icon: Package },
  { id: 'profiles', label: 'Profiles', Icon: Layers },
  { id: 'accounts', label: 'Player Accounts', Icon: Users },
  { id: 'settings', label: 'Settings', Icon: Sliders },
  { id: 'diagnostics', label: 'Diagnostics', Icon: Activity },
  { id: 'about', label: 'About', Icon: Info },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onSelectPage }) => {
  return (
    <aside className="w-56 h-full flex flex-col flex-shrink-0 bg-[#0d1017] border-r border-white/[0.07] select-none">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-white/[0.07] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-black text-sm shadow-sm">
          S
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-wide text-white">SAMRAT</span>
          <span className="text-[10px] font-medium text-cyan-400 uppercase tracking-wider">
            Minecraft 1.8.9
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-2.5 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(({ id, label, Icon }) => {
          const active = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onSelectPage(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer text-left ${
                active
                  ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Icon
                size={16}
                className={active ? 'text-cyan-400' : 'text-gray-500'}
                strokeWidth={active ? 2.5 : 2}
              />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-white/[0.07] flex items-center justify-between text-[11px] text-gray-500 bg-[#090b10]">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Shield size={12} className="text-emerald-400" />
          <span>Anti-Cheat Safe</span>
        </div>
        <span className="font-mono text-[10px] text-gray-500 bg-white/[0.05] px-1.5 py-0.5 rounded">
          v1.0.0
        </span>
      </div>
    </aside>
  );
};
