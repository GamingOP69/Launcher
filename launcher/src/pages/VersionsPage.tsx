import React, { useState } from 'react';
import { GitBranch, CheckCircle2, Download, Tag, Clock } from 'lucide-react';

export const VersionsPage: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<'stable' | 'beta' | 'nightly'>('stable');

  const versions = [
    {
      id: '1.0.0',
      title: 'Samrat 1.8.9 Release',
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
    <div style={{ padding: '24px', gap: '20px' }} className="flex flex-col flex-1 overflow-y-auto text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>CLIENT VERSIONS & BUILDS</h2>
          <p style={{ fontSize: '12px', color: '#8fa2b7' }}>Switch client release channels, inspect changelogs, and manage versions.</p>
        </div>

        {/* Release Channel Selector */}
        <div style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', borderRadius: '8px', padding: '3px' }} className="flex items-center gap-1">
          {(['stable', 'beta', 'nightly'] as const).map((channel) => (
            <button
              key={channel}
              onClick={() => setSelectedChannel(channel)}
              style={{
                backgroundColor: selectedChannel === channel ? '#00f0ff' : 'transparent',
                color: selectedChannel === channel ? '#0c1017' : '#8fa2b7',
                fontWeight: selectedChannel === channel ? 800 : 600,
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                textTransform: 'uppercase',
              }}
              className="cursor-pointer transition-all"
            >
              {channel}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((ver) => (
          <div
            key={ver.id}
            style={{
              backgroundColor: ver.status.includes('Active') ? '#1c2433' : '#141a24',
              border: ver.status.includes('Active') ? '1px solid #00f0ff' : '1px solid #222e3f',
              padding: '18px 20px',
              borderRadius: '12px',
            }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#0c1017' }}>
                  <GitBranch size={18} style={{ color: '#00f0ff' }} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>{ver.title}</span>
                    <span style={{ fontSize: '10px', backgroundColor: '#0c1017', color: '#00f0ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }} className="font-mono">
                      v{ver.id}
                    </span>
                    <span style={{ fontSize: '10px', backgroundColor: '#242e40', color: '#a0c8ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      MC {ver.minecraft}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                    <Clock size={12} />
                    <span>Released {ver.date}</span>
                  </div>
                </div>
              </div>

              <div>
                {ver.status.includes('Active') ? (
                  <span style={{ color: '#00e676', fontSize: '12px', fontWeight: 700 }} className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Installed & Active
                  </span>
                ) : (
                  <button
                    style={{ backgroundColor: '#242e40', color: '#ffffff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
                    className="flex items-center gap-1.5 hover:bg-surface-hover cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                )}
              </div>
            </div>

            <div style={{ backgroundColor: '#0c1017', borderRadius: '8px', padding: '10px 14px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#8fa2b7', marginBottom: '4px' }} className="uppercase">Changelog Highlights:</div>
              <ul style={{ fontSize: '11px', color: '#ffffff', gap: '3px' }} className="flex flex-col list-disc list-inside">
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
