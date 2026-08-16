import React, { useState } from 'react';
import { GitBranch, CheckCircle2, Download, Tag, Clock } from 'lucide-react';

export const VersionsPage: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<'stable' | 'beta' | 'nightly'>('stable');

  const versions = [
    {
      id: '1.0.0',
      title: 'Samrat 1.8.9 Official Release',
      channel: 'stable',
      date: 'Aug 16, 2026',
      status: 'Installed & Active',
      minecraft: '1.8.9',
      highlights: [
        'Complete Bedwars 8-team HUD matrix',
        'FastMath precomputed lookup engine',
        'Frustum entity culling & particle optimizer',
        'Magnetic HUD editor & Right-Shift menu',
      ],
    },
    {
      id: '0.9.8-beta',
      title: 'Bedwars Timers Beta',
      channel: 'beta',
      date: 'Aug 10, 2026',
      status: 'Available',
      minecraft: '1.8.9',
      highlights: [
        'Added Diamond/Emerald tier countdowns',
        'Build height alert threshold warning',
      ],
    },
    {
      id: 'nightly-canary',
      title: 'Nightly Experimental Build',
      channel: 'nightly',
      date: 'Automated Daily',
      status: 'Available',
      minecraft: '1.8.9',
      highlights: [
        'Cutting-edge memory defragmentation heuristics',
        'Experimental OpenGL state cache',
      ],
    },
  ];

  const filtered = versions.filter((v) => v.channel === selectedChannel || selectedChannel === 'stable');

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto text-left w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black text-white tracking-wide">CLIENT VERSIONS & BUILDS</h2>
          <p className="text-xs text-slate-400">Switch client release channels, inspect changelogs, and manage versions.</p>
        </div>

        {/* Release Channel Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
          {(['stable', 'beta', 'nightly'] as const).map((channel) => (
            <button
              key={channel}
              onClick={() => setSelectedChannel(channel)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                selectedChannel === channel
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {channel}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {filtered.map((ver) => (
          <div
            key={ver.id}
            className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3 shadow-sm hover:border-slate-700 transition-all duration-150"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Tag size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{ver.title}</h3>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                      v{ver.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <Clock size={12} />
                    <span>{ver.date}</span>
                    <span>•</span>
                    <span>Minecraft {ver.minecraft}</span>
                  </div>
                </div>
              </div>

              {ver.status === 'Installed & Active' ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 size={13} /> Installed
                </span>
              ) : (
                <button
                  onClick={() => alert(`Installing build ${ver.id}...`)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/40 transition-colors cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              )}
            </div>

            <div className="bg-slate-950/60 border border-slate-800/60 p-3 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Release Highlights:</span>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                {ver.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
