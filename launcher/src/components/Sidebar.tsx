import React from 'react';
import { 
  Home, 
  Layers, 
  Sparkles, 
  Users, 
  Sliders, 
  Activity, 
  Info,
  Shield,
  Palette,
  GitBranch,
  Package
} from 'lucide-react';

export type PageId = 'home' | 'client' | 'versions' | 'mods' | 'profiles' | 'accounts' | 'cosmetics' | 'settings' | 'diagnostics' | 'about';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onSelectPage }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, badge: null },
    { id: 'client', label: 'Client 1.8.9', icon: Sparkles, badge: 'PRO' },
    { id: 'versions', label: 'Versions', icon: GitBranch, badge: null },
    { id: 'mods', label: 'Mods & Addons', icon: Package, badge: null },
    { id: 'profiles', label: 'Profiles', icon: Layers, badge: null },
    { id: 'accounts', label: 'Accounts', icon: Users, badge: null },
    { id: 'cosmetics', label: 'Cosmetics', icon: Palette, badge: 'NEW' },
    { id: 'settings', label: 'Settings', icon: Sliders, badge: null },
    { id: 'diagnostics', label: 'Diagnostics', icon: Activity, badge: null },
    { id: 'about', label: 'About', icon: Info, badge: null },
  ];

  return (
    <aside className="w-56 bg-dark-950/90 border-r border-slate-800/80 flex flex-col h-full flex-shrink-0 select-none z-20 backdrop-blur-md">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-dark-950 text-xl shadow-lg shadow-cyan-500/20">
          S
        </div>
        <div className="flex flex-col">
          <h1 className="font-extrabold text-sm tracking-wider text-white">SAMRAT</h1>
          <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase">
            PvP & Bedwars
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="p-3 flex-1 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id as PageId)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group cursor-pointer ${
                isActive 
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10 font-bold' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className={`transition-transform duration-150 group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  isActive ? 'bg-cyan-400 text-dark-950' : 'bg-slate-800 text-cyan-400 group-hover:bg-cyan-500/20'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Status Pill */}
      <div className="p-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 bg-dark-950/40">
        <div className="flex items-center gap-1.5">
          <Shield size={13} className="text-emerald-400" />
          <span className="text-slate-300 font-medium">Anti-Cheat Safe</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800/80">v1.0.0</span>
      </div>
    </aside>
  );
};
