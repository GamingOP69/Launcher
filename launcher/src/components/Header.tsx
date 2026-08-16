import React from 'react';
import { AuthAccount } from '../types/account';
import { Wifi, ShieldCheck, ChevronRight } from 'lucide-react';

interface HeaderProps {
  activeAccount: AuthAccount | null;
  isRunning: boolean;
  onOpenAccounts: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeAccount, isRunning, onOpenAccounts }) => {
  return (
    <header className="h-14 bg-dark-950/60 border-b border-slate-800/80 px-6 flex items-center justify-between flex-shrink-0 backdrop-blur-md z-10 select-none">
      {/* Status Badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full text-xs">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50' : 'bg-slate-400'}`} />
          <span className="text-slate-300 font-medium text-[11px]">
            {isRunning ? 'Client Running' : 'Client Ready'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full text-slate-300 text-[11px] font-medium">
          <Wifi size={13} className="text-cyan-400" />
          <span>Minecraft 1.8.9</span>
        </div>
      </div>

      {/* User Account Card */}
      <button 
        onClick={onOpenAccounts}
        className="flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer group shadow-sm"
      >
        <img 
          src={activeAccount?.avatar_url || 'https://mc-heads.net/avatar/Steve/100'} 
          alt="Avatar" 
          className="w-6 h-6 rounded-full bg-slate-950 border border-slate-700 object-cover" 
        />
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
            {activeAccount?.username || 'Guest Player'}
          </span>
          {activeAccount?.is_dev_mode && (
            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold px-1.5 py-0.2 rounded">
              DEV
            </span>
          )}
        </div>
        <ChevronRight size={14} className="text-slate-400 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
      </button>
    </header>
  );
};
