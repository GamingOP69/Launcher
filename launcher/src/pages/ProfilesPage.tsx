import React, { useState } from 'react';
import { ProfileItem } from '../types/profile';
import { Layers, Plus, Check, Trash2, Sliders, X } from 'lucide-react';

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
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto text-left w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black text-white tracking-wide">CONFIGURATION PROFILES</h2>
          <p className="text-xs text-slate-400">Manage module configurations, HUD layouts, and performance presets.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-md shadow-cyan-500/20 transition-all duration-150 cursor-pointer"
        >
          <Plus size={15} />
          <span>New Profile</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {profiles.map((p) => {
          const isSelected = p.id === selectedProfileId;
          return (
            <div
              key={p.id}
              className={`p-5 rounded-2xl flex items-center justify-between transition-all duration-150 border ${
                isSelected 
                  ? 'bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-500/10' 
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl border ${
                  isSelected ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  <Layers size={18} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{p.name}</span>
                    {p.isPreset && (
                      <span className="text-[9px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded">
                        BUILT-IN PRESET
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded uppercase">
                      {p.performancePreset}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5">{p.description}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {isSelected ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                    <Check size={14} /> Active
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectProfile(p.id)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/40 transition-colors cursor-pointer"
                  >
                    Activate
                  </button>
                )}

                {!p.isPreset && (
                  <button
                    onClick={() => onDeleteProfile(p.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Profile"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders size={16} className="text-cyan-400" />
                <span>Create New Profile</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Profile Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ranked Bedwars"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-white px-3.5 py-2.5 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Performance Preset</label>
                <select
                  value={newPreset}
                  onChange={(e) => setNewPreset(e.target.value as ProfileItem['performancePreset'])}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-white px-3.5 py-2.5 rounded-xl text-xs outline-none cursor-pointer"
                >
                  <option value="BALANCED">Balanced (Standard)</option>
                  <option value="HIGH_FPS">High FPS (Competitions)</option>
                  <option value="ULTRA_FPS">Ultra FPS (Low-End Hardware)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300"
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
