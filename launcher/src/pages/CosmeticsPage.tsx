import React, { useState } from 'react';
import { Palette, Sparkles, Check } from 'lucide-react';

export const CosmeticsPage: React.FC = () => {
  const [activeCape, setActiveCape] = useState('cyan_crest');

  const capes = [
    { id: 'cyan_crest', name: 'Samrat Neon Crest', color: 'linear-gradient(135deg, #00f0ff, #0044aa)', desc: 'Official Emperor Neon Cyan cloak' },
    { id: 'dark_void', name: 'Void Walker', color: 'linear-gradient(135deg, #1c2433, #0c1017)', desc: 'Sleek stealth obsidian cloak' },
    { id: 'emerald_dragon', name: 'Emerald Bedwars', color: 'linear-gradient(135deg, #00e676, #004d40)', desc: 'Commemorative Bedwars emerald cape' },
    { id: 'flame_streak', name: 'PvP Firestorm', color: 'linear-gradient(135deg, #ff1744, #ffab00)', desc: 'Aggressive ranked combat streak cape' },
  ];

  return (
    <div style={{ padding: '24px', gap: '20px' }} className="flex flex-col flex-1 overflow-y-auto text-left">
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>COSMETICS & CAPES</h2>
        <p style={{ fontSize: '12px', color: '#8fa2b7' }}>Customize client-side cosmetics and exclusive Samrat original cloaks.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {capes.map((cape) => {
          const isSelected = activeCape === cape.id;
          return (
            <div
              key={cape.id}
              onClick={() => setActiveCape(cape.id)}
              style={{
                backgroundColor: '#141a24',
                border: isSelected ? '2px solid #00f0ff' : '1px solid #222e3f',
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
              className="flex flex-col gap-3 hover:border-focused transition-all"
            >
              {/* Cape Preview Canvas */}
              <div
                style={{
                  height: '140px',
                  borderRadius: '8px',
                  background: cape.color,
                  boxShadow: isSelected ? '0 0 15px rgba(0, 240, 255, 0.4)' : 'none',
                }}
                className="flex items-center justify-center text-black font-extrabold text-2xl"
              >
                S
              </div>

              <div className="flex items-center justify-between">
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{cape.name}</span>
                {isSelected && <Check size={14} style={{ color: '#00f0ff' }} />}
              </div>

              <p style={{ fontSize: '11px', color: '#8fa2b7', lineHeight: 1.3 }}>{cape.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
