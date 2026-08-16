import React from 'react';
import { Play, Square, Loader2 } from 'lucide-react';

interface PlayButtonProps {
  isRunning: boolean;
  isLoading: boolean;
  onLaunch: () => void;
  onTerminate: () => void;
}

export const PlayButton: React.FC<PlayButtonProps> = ({ isRunning, isLoading, onLaunch, onTerminate }) => {
  if (isLoading) {
    return (
      <button 
        disabled
        style={{
          backgroundColor: '#1c2433',
          border: '1px solid #00f0ff',
          color: '#00f0ff',
          padding: '16px 36px',
          borderRadius: '12px',
          fontWeight: 800,
          fontSize: '16px',
          letterSpacing: '1px',
        }}
        className="flex items-center gap-3 shadow-lg opacity-80 cursor-not-allowed"
      >
        <Loader2 size={20} className="animate-spin" />
        <span>LAUNCHING...</span>
      </button>
    );
  }

  if (isRunning) {
    return (
      <button
        onClick={onTerminate}
        style={{
          background: 'linear-gradient(135deg, #ff1744, #b71c1c)',
          color: '#ffffff',
          padding: '16px 36px',
          borderRadius: '12px',
          fontWeight: 800,
          fontSize: '16px',
          letterSpacing: '1px',
        }}
        className="flex items-center gap-3 shadow-lg hover:opacity-95 active:scale-98 transition-all cursor-pointer"
      >
        <Square size={20} fill="#fff" />
        <span>STOP CLIENT</span>
      </button>
    );
  }

  return (
    <button
      onClick={onLaunch}
      style={{
        background: 'linear-gradient(135deg, #00f0ff, #0088ff)',
        color: '#0c1017',
        padding: '16px 44px',
        borderRadius: '12px',
        fontWeight: 800,
        fontSize: '16px',
        letterSpacing: '1.5px',
        boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)',
      }}
      className="flex items-center gap-3 hover:scale-102 active:scale-98 transition-all cursor-pointer glow-cyan-hover"
    >
      <Play size={22} fill="#0c1017" />
      <span>PLAY SAMRAT</span>
    </button>
  );
};
