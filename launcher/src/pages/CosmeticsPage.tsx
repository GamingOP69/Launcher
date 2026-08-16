import React, { useState } from 'react';
import { Check } from 'lucide-react';

export const CosmeticsPage: React.FC = () => {
  const [activeCape, setActiveCape] = useState('cyan_crest');

  const capes = [
    { id: 'cyan_crest', name: 'Samrat Neon Crest', color: 'from-cyan-400 to-blue-600', desc: 'Official Emperor Neon Cyan cloak' },
    { id: 'dark_void', name: 'Void Walker', color: 'from-slate-800 to-slate-950', desc: 'Sleek stealth obsidian cloak' },
    { id: 'emerald_dragon', name: 'Emerald Bedwars', color: 'from-emerald-400 to-teal-700', desc: 'Commemorative Bedwars emerald cape' },
    { id: 'flame_streak', name: 'PvP Firestorm', color: 'from-amber-400 to-rose-600', desc: 'Aggressive ranked combat streak cape' },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto text-left w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-white tracking-wide">COSMETICS & CAPES</h2>
        <p className="text-xs text-slate-400">Customize client-side cosmetics and exclusive Samrat cloaks.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {capes.map((cape) => {
          const isSelected = activeCape === cape.id;
          return (
            <div
              key={cape.id}
              onClick={() => setActiveCape(cape.id)}
              className={`p-4 rounded-2xl flex flex-col gap-3 transition-all duration-150 cursor-pointer border ${
                isSelected 
                  ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10' 
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Cape Preview Canvas */}
              <div
                className={`h-36 rounded-xl bg-gradient-to-br ${cape.color} flex items-center justify-center font-black text-2xl text-slate-950/80 shadow-md ${
                  isSelected ? 'ring-2 ring-cyan-400 shadow-cyan-500/20' : ''
                }`}
              >
                S
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{cape.name}</span>
                {isSelected && <Check size={14} className="text-cyan-400" />}
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">{cape.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
