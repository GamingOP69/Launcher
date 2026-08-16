import React, { useState, useEffect } from 'react';
import { ProfileItem } from '../types/profile';
import { Layers, Plus, Check, Trash2, Sliders, X } from 'lucide-react';
import { invokeCommand } from '../services/tauriBridge';

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

  const handleCreate = async () => {
    const clean = newProfileName.trim();
    if (clean) {
      onCreateProfile(clean, newPreset);
      try {
        await invokeCommand('save_custom_profile', {
          name: clean,
          preset: newPreset,
        });
      } catch (e) {
        console.warn(e);
      }
      setNewProfileName('');
      setShowCreateModal(false);
    }
  };

  const handleDelete = async (id: string) => {
    onDeleteProfile(id);
    try {
      await invokeCommand('delete_custom_profile', { name: id });
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto text-left w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white tracking-wide">CONFIGURATION PROFILES</h2>
          <p className="text-xs text-gray-400">
            Manage module configurations, HUD layouts, and performance presets.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-colors cursor-pointer"
        >
          <Plus size={15} />
          <span>New Profile</span>
        </button>
      </div>

      {/* Profiles List */}
      <div className="flex flex-col gap-2.5">
        {profiles.map((p) => {
          const isSelected = p.id === selectedProfileId;
          return (
            <div
              key={p.id}
              className={`p-4 rounded-xl flex items-center justify-between transition-all border ${
                isSelected
                  ? 'bg-[#141824] border-cyan-500/40 shadow-sm'
                  : 'bg-[#10141f] hover:bg-[#141824] border-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`p-2.5 rounded-lg border ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                      : 'bg-[#181d2c] border-white/[0.06] text-gray-500'
                  }`}
                >
                  <Layers size={17} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{p.name}</span>
                    {p.isPreset && (
                      <span className="text-[9px] bg-white/[0.06] text-gray-400 font-bold px-1.5 py-0.5 rounded">
                        PRESET
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded uppercase">
                      {p.performancePreset}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 mt-0.5">{p.description}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isSelected ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                    <Check size={13} /> Active
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectProfile(p.id)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-300 bg-[#181d2c] hover:bg-[#20273a] hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
                  >
                    Activate
                  </button>
                )}

                {!p.isPreset && (
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Profile"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#121622] border border-white/[0.1] p-5 rounded-2xl max-w-md w-full flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders size={15} className="text-cyan-400" />
                <span>Create Custom Profile</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-gray-300 mb-1 block">Profile Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ranked Bedwars"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full bg-[#0d1017] border border-white/[0.08] focus:border-cyan-500/40 text-white px-3 py-2 rounded-lg text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 mb-1 block">
                  Performance Preset
                </label>
                <select
                  value={newPreset}
                  onChange={(e) =>
                    setNewPreset(e.target.value as ProfileItem['performancePreset'])
                  }
                  className="w-full bg-[#0d1017] border border-white/[0.08] focus:border-cyan-500/40 text-white px-3 py-2 rounded-lg text-xs outline-none cursor-pointer"
                >
                  <option value="BALANCED">Balanced (Standard)</option>
                  <option value="HIGH_FPS">High FPS (Competitive)</option>
                  <option value="ULTRA_FPS">Ultra FPS (Low-End PC)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-[#181d2c] hover:bg-[#20273a]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300"
              >
                Create Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
