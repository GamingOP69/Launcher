import React, { useState } from 'react';
import { ProfileItem } from '../types/profile';
import { Layers, Plus, Download, Upload, Check, Trash2 } from 'lucide-react';

interface ProfilesPageProps {
  profiles: ProfileItem[];
  selectedProfileId: string;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string, preset: ProfileItem['performancePreset']) => void;
  onDeleteProfile: (id: string) => void;
}

export const ProfilesPage: React.FC<ProfilesPageProps> = ({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
}) => {
  const [newProfileName, setNewProfileName] = useState('');
  const [newPreset, setNewPreset] = useState<ProfileItem['performancePreset']>('BALANCED');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreate = () => {
    if (newProfileName.trim()) {
      onCreateProfile(newProfileName.trim(), newPreset);
      setNewProfileName('');
      setShowCreateModal(false);
    }
  };

  return (
    <div style={{ padding: '24px', gap: '20px' }} className="flex flex-col flex-1 overflow-y-auto text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>CONFIGURATION PROFILES</h2>
          <p style={{ fontSize: '12px', color: '#8fa2b7' }}>Manage module configurations, HUD layouts, and performance presets.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{ backgroundColor: '#00f0ff', color: '#0c1017', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 800 }}
          className="flex items-center gap-2 hover:opacity-90 cursor-pointer glow-cyan"
        >
          <Plus size={16} />
          <span>New Profile</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {profiles.map((p) => {
          const isSelected = p.id === selectedProfileId;
          return (
            <div
              key={p.id}
              style={{
                backgroundColor: isSelected ? '#1c2433' : '#141a24',
                border: isSelected ? '1px solid #00f0ff' : '1px solid #222e3f',
                padding: '16px 20px',
                borderRadius: '10px',
              }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#0c1017' }}>
                  <Layers size={18} style={{ color: '#00f0ff' }} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{p.name}</span>
                    {p.isPreset && (
                      <span style={{ fontSize: '9px', backgroundColor: '#222e3f', color: '#a0c8ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        BUILT-IN PRESET
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: '#8fa2b7' }}>
                    {p.description} • Preset: <span style={{ color: '#00f0ff' }}>{p.performancePreset}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isSelected ? (
                  <button
                    onClick={() => onSelectProfile(p.id)}
                    style={{ backgroundColor: '#242e40', color: '#ffffff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
                    className="hover:bg-surface-hover cursor-pointer"
                  >
                    Activate
                  </button>
                ) : (
                  <span style={{ color: '#00e676', fontSize: '12px', fontWeight: 700 }} className="flex items-center gap-1">
                    <Check size={14} /> Active
                  </span>
                )}

                {!p.isPreset && (
                  <button
                    onClick={() => onDeleteProfile(p.id)}
                    style={{ color: '#ff1744', padding: '6px', borderRadius: '6px' }}
                    className="hover:bg-surface-hover cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100 }} className="flex items-center justify-center p-6">
          <div style={{ width: '420px', backgroundColor: '#101620', border: '1px solid #222e3f', borderRadius: '12px', padding: '24px' }} className="flex flex-col gap-4">
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>Create New Profile</h3>
            
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '11px', color: '#8fa2b7' }}>Profile Name</label>
              <input
                type="text"
                placeholder="e.g. My Ranked Bedwars"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                style={{ backgroundColor: '#0c1017', border: '1px solid #222e3f', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '11px', color: '#8fa2b7' }}>Performance Preset</label>
              <select
                value={newPreset}
                onChange={(e) => setNewPreset(e.target.value as ProfileItem['performancePreset'])}
                style={{ backgroundColor: '#0c1017', border: '1px solid #222e3f', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="BALANCED">Balanced</option>
                <option value="QUALITY">Quality</option>
                <option value="HIGH_FPS">High FPS</option>
                <option value="ULTRA_FPS">Ultra FPS</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ backgroundColor: '#1c2433', color: '#fff', padding: '8px 14px', borderRadius: '6px', fontSize: '12px' }}
                className="cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                style={{ backgroundColor: '#00f0ff', color: '#0c1017', padding: '8px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 800 }}
                className="cursor-pointer glow-cyan"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
