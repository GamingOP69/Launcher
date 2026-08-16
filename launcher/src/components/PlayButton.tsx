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
        className="flex items-center gap-3 px-8 py-3.5 rounded-xl font-extrabold text-sm tracking-wider text-cyan-400 bg-slate-900 border border-cyan-500/50 shadow-lg shadow-cyan-500/20 opacity-80 cursor-not-allowed select-none"
      >
        <Loader2 size={18} className="animate-spin text-cyan-400" />
        <span>LAUNCHING...</span>
      </button>
    );
  }

  if (isRunning) {
    return (
      <button
        onClick={onTerminate}
        className="flex items-center gap-3 px-8 py-3.5 rounded-xl font-extrabold text-sm tracking-wider text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 border border-red-500/30 shadow-lg shadow-red-500/30 active:scale-98 transition-all duration-150 cursor-pointer select-none"
      >
        <Square size={18} fill="#fff" />
        <span>STOP CLIENT</span>
      </button>
    );
  }

  return (
    <button
      onClick={onLaunch}
      className="flex items-center gap-3 px-9 py-3.5 rounded-xl font-black text-sm tracking-widest text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-98 transition-all duration-150 cursor-pointer select-none group"
    >
      <Play size={18} fill="#020617" className="transition-transform group-hover:scale-110" />
      <span>PLAY NOW</span>
    </button>
  );
};
