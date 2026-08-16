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
    <div style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '12px 16px', borderRadius: '10px' }} className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label style={{ fontSize: '11px', color: '#8fa2b7', fontWeight: 600 }} className="flex items-center gap-1.5 uppercase tracking-wider">
          <Layers size={13} style={{ color: '#00f0ff' }} />
          <span>Active Profile</span>
        </label>
        <span style={{ fontSize: '10px', color: '#586b7f' }}>Config & Performance</span>
      </div>

      <select
        value={selectedProfileId}
        onChange={(e) => onSelect(e.target.value)}
        style={{
          backgroundColor: '#0c1017',
          border: '1px solid #222e3f',
          color: '#ffffff',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 600,
          outline: 'none',
        }}
        className="cursor-pointer hover:border-focused"
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} {p.isPreset ? '(Preset)' : ''} — {p.performancePreset}
          </option>
        ))}
      </select>
    </div>
  );
};
