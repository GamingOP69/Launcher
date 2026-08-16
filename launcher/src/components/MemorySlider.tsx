import React from 'react';
import { Cpu } from 'lucide-react';

interface MemorySliderProps {
  ramMb: number;
  onChange: (ramMb: number) => void;
}

export const MemorySlider: React.FC<MemorySliderProps> = ({ ramMb, onChange }) => {
  const gbValue = (ramMb / 1024).toFixed(1);

  return (
    <div style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '12px 16px', borderRadius: '10px' }} className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label style={{ fontSize: '11px', color: '#8fa2b7', fontWeight: 600 }} className="flex items-center gap-1.5 uppercase tracking-wider">
          <Cpu size={13} style={{ color: '#00f0ff' }} />
          <span>RAM Allocation</span>
        </label>
        <span style={{ fontSize: '13px', color: '#00f0ff', fontWeight: 700 }} className="font-mono">
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
        style={{
          accentColor: '#00f0ff',
          cursor: 'pointer',
        }}
        className="w-full"
      />

      <div style={{ fontSize: '10px', color: '#586b7f' }} className="flex justify-between font-mono">
        <span>1 GB (Min)</span>
        <span>3 GB (Recommended)</span>
        <span>16 GB (Max)</span>
      </div>
    </div>
  );
};
