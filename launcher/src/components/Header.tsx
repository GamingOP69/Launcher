import React from 'react';
import { AuthAccount } from '../types/account';
import { Wifi, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeAccount: AuthAccount | null;
  isRunning: boolean;
  onOpenAccounts: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeAccount, isRunning, onOpenAccounts }) => {
  return (
    <header style={{ height: '54px', backgroundColor: '#0c1017', borderBottom: '1px solid #222e3f', padding: '0 24px' }} className="flex items-center justify-between flex-shrink-0">
      {/* Status Badges */}
      <div className="flex items-center gap-3">
        <div style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '4px 10px', borderRadius: '20px' }} className="flex items-center gap-2 text-xs">
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isRunning ? '#00e676' : '#8fa2b7' }} className={isRunning ? 'animate-pulse' : ''} />
          <span style={{ color: '#8fa2b7', fontSize: '11px' }}>
            {isRunning ? 'Client Running' : 'Client Ready'}
          </span>
        </div>

        <div style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '4px 10px', borderRadius: '20px', color: '#8fa2b7', fontSize: '11px' }} className="flex items-center gap-1.5">
          <Wifi size={12} style={{ color: '#00f0ff' }} />
          <span>Minecraft 1.8.9</span>
        </div>
      </div>

      {/* User Account Card */}
      <div 
        onClick={onOpenAccounts}
        style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '4px 10px 4px 6px', borderRadius: '20px', cursor: 'pointer' }}
        className="flex items-center gap-2 hover:border-focused transition-all"
      >
        <img 
          src={activeAccount?.avatar_url || 'https://mc-heads.net/avatar/Steve/100'} 
          alt="Avatar" 
          style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0c1017' }} 
        />
        <div className="flex flex-col text-left">
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
            {activeAccount?.username || 'Guest / Dev'}
          </span>
        </div>
        {activeAccount?.is_dev_mode && (
          <span style={{ fontSize: '9px', backgroundColor: '#ffab00', color: '#000', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>
            DEV
          </span>
        )}
      </div>
    </header>
  );
};
