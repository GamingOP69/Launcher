import React from 'react';
import { AuthAccount } from '../types/account';
import { ChevronRight, FolderOpen } from 'lucide-react';
import { invokeCommand } from '../services/tauriBridge';

interface HeaderProps {
  activeAccount: AuthAccount | null;
  isRunning: boolean;
  onOpenAccounts: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeAccount, isRunning, onOpenAccounts }) => {
  const handleOpenGameFolder = () => {
    invokeCommand('open_folder', { folderType: 'game' }).catch(console.warn);
  };

  return (
    <header className="h-13 bg-[#0d1017] border-b border-white/[0.07] px-6 flex items-center justify-between flex-shrink-0 select-none">
      {/* Status Badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#141824] border border-white/[0.07] px-3 py-1 rounded-lg text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
            }`}
          />
          <span className="text-gray-300 font-medium text-[11px]">
            {isRunning ? 'Client Process Active' : 'Ready to Launch'}
          </span>
        </div>

        <button
          onClick={handleOpenGameFolder}
          className="flex items-center gap-1.5 bg-[#141824] hover:bg-[#1c2233] border border-white/[0.07] hover:border-cyan-500/40 px-2.5 py-1 rounded-lg text-gray-300 text-[11px] font-medium transition-colors cursor-pointer"
          title="Open Minecraft .samrat/game folder"
        >
          <FolderOpen size={13} className="text-cyan-400" />
          <span>Game Directory</span>
        </button>
      </div>

      {/* User Account Card */}
      <button
        onClick={onOpenAccounts}
        className="flex items-center gap-2.5 bg-[#141824] hover:bg-[#1c2233] border border-white/[0.07] hover:border-cyan-500/40 px-3 py-1 rounded-lg transition-colors cursor-pointer group shadow-sm"
      >
        <img
          src={activeAccount?.avatar_url || 'https://mc-heads.net/avatar/Steve/64'}
          alt="Avatar"
          className="w-5 h-5 rounded-full bg-black border border-white/[0.1] object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steve/64';
          }}
        />
        <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
          {activeAccount?.username || 'Guest Player'}
        </span>
        <ChevronRight
          size={14}
          className="text-gray-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5"
        />
      </button>
    </header>
  );
};
