import React from 'react';
import { ProfileItem } from '../types/profile';
import { Layers } from 'lucide-react';

interface ProfileSelectorProps {
  profiles: ProfileItem[];
  selectedProfileId: string;
  onSelect: (profileId: string) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ profiles, selectedProfileId, onSelect }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5 shadow-sm">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Layers size={14} className="text-cyan-400" />
          <span>Active Profile</span>
        </label>
        <span className="text-[11px] text-slate-400 font-medium">Performance Tuning</span>
      </div>

      <select
        value={selectedProfileId}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-white px-3.5 py-2.5 rounded-lg text-xs font-semibold outline-none cursor-pointer transition-colors duration-150"
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id} className="bg-slate-950 text-white">
            {p.name} {p.isPreset ? '★' : ''} — {p.performancePreset} Mode
          </option>
        ))}
      </select>
    </div>
  );
};
