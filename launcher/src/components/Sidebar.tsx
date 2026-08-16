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
    { id: 'home', label: 'Home', icon: Home },
    { id: 'client', label: 'Client 1.8.9', icon: Sparkles },
    { id: 'versions', label: 'Versions', icon: GitBranch },
    { id: 'mods', label: 'Mods & Addons', icon: Package },
    { id: 'profiles', label: 'Profiles', icon: Layers },
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'cosmetics', label: 'Cosmetics', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Sliders },
    { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <aside style={{ width: '220px', backgroundColor: '#101620', borderRight: '1px solid #222e3f' }} className="flex flex-col h-full flex-shrink-0">
      {/* Brand Header */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #222e3f' }} className="flex items-center gap-3">
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #00f0ff, #0066cc)' }} className="flex items-center justify-center font-bold text-black text-xl shadow-lg">
          S
        </div>
        <div>
          <h1 className="font-extrabold text-sm tracking-wider text-white">SAMRAT</h1>
          <p style={{ color: '#00f0ff', fontSize: '10px', fontWeight: 600 }}>PVP & BEDWARS</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '16px 10px', gap: '4px' }} className="flex-1 flex flex-col overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id as PageId)}
              style={{
                padding: '9px 12px',
                borderRadius: '6px',
                backgroundColor: isActive ? '#1c2433' : 'transparent',
                color: isActive ? '#00f0ff' : '#8fa2b7',
                borderLeft: isActive ? '3px solid #00f0ff' : '3px solid transparent',
                textAlign: 'left',
                transition: 'all 0.15s ease-in-out',
              }}
              className="flex items-center gap-3 text-xs font-semibold hover:bg-surface-hover hover:text-white cursor-pointer w-full"
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Status Pill */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid #222e3f', fontSize: '11px', color: '#586b7f' }} className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Shield size={12} style={{ color: '#00e676' }} />
          <span>Anti-Cheat Safe</span>
        </div>
        <span className="font-mono">v1.0.0</span>
      </div>
    </aside>
  );
};
