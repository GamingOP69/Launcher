import React from 'react';
import { Cpu } from 'lucide-react';

interface MemorySliderProps {
  ramMb: number;
  onChange: (ramMb: number) => void;
}

export const MemorySlider: React.FC<MemorySliderProps> = ({ ramMb, onChange }) => {
  const gbValue = (ramMb / 1024).toFixed(1);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5 shadow-sm">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Cpu size={14} className="text-cyan-400" />
          <span>RAM Allocation</span>
        </label>
        <span className="text-xs font-bold text-cyan-400 font-mono bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
          {gbValue} GB ({ramMb} MB)
        </span>
      </div>

      <input
        type="range"
        min={1024}
        max={16384}
        step={512}
        value={ramMb}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-950 rounded-lg appearance-none"
      />

      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
        <span>1 GB (Min)</span>
        <span className="text-emerald-400 font-medium">3-4 GB (Optimal)</span>
        <span>16 GB (Max)</span>
      </div>
    </div>
  );
};
