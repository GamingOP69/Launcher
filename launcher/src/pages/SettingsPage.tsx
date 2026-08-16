import React, { useState, useEffect } from 'react';
import { LauncherConfig } from '../types/config';
import { JavaRuntimeInfo } from '../types/diagnostics';
import { invokeCommand } from '../services/tauriBridge';
import { Sliders, RefreshCw, Check, Monitor, Shield } from 'lucide-react';

interface SettingsPageProps {
  config: LauncherConfig;
  onUpdateConfig: (updated: Partial<LauncherConfig>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ config, onUpdateConfig }) => {
  const [runtimes, setRuntimes] = useState<JavaRuntimeInfo[]>([]);
  const [detectingJava, setDetectingJava] = useState(false);

  const handleDetectJava = async () => {
    setDetectingJava(true);
    try {
      const detected = await invokeCommand<JavaRuntimeInfo[]>('detect_java');
      setRuntimes(detected);
    } catch (e) {
      console.error(e);
    } finally {
      setDetectingJava(false);
    }
  };

  useEffect(() => {
    handleDetectJava();
  }, []);

  return (
    <div style={{ padding: '24px', gap: '24px' }} className="flex flex-col flex-1 overflow-y-auto text-left">
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>LAUNCHER SETTINGS</h2>
        <p style={{ fontSize: '12px', color: '#8fa2b7' }}>Configure Java runtimes, JVM optimization flags, and window resolutions.</p>
      </div>

      {/* Java Runtime Management */}
      <div style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '18px', borderRadius: '12px' }} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Java Runtime</h3>
          <button
            onClick={handleDetectJava}
            style={{ backgroundColor: '#1c2433', color: '#00f0ff', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}
            className="flex items-center gap-1.5 hover:bg-surface-hover cursor-pointer"
          >
            <RefreshCw size={12} className={detectingJava ? 'animate-spin' : ''} />
            <span>Auto-Detect Java</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {runtimes.map((rt, i) => (
            <div
              key={i}
              onClick={() => onUpdateConfig({ javaPath: rt.path })}
              style={{
                backgroundColor: config.javaPath === rt.path ? '#1c2433' : '#0c1017',
                border: config.javaPath === rt.path ? '1px solid #00f0ff' : '1px solid #222e3f',
                padding: '10px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                  {rt.vendor} ({rt.version}) {rt.is_recommended && <span style={{ color: '#00f0ff', fontSize: '10px' }}>★ Recommended</span>}
                </span>
                <span style={{ fontSize: '10px', color: '#586b7f' }} className="font-mono">{rt.path}</span>
              </div>
              {config.javaPath === rt.path && <Check size={16} style={{ color: '#00f0ff' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* JVM Arguments */}
      <div style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '18px', borderRadius: '12px' }} className="flex flex-col gap-2">
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>JVM Arguments</h3>
        <p style={{ fontSize: '11px', color: '#8fa2b7' }}>Safe performance tuning flags (G1GC, region size, experimental options).</p>
        <textarea
          value={config.customJvmArgs}
          onChange={(e) => onUpdateConfig({ customJvmArgs: e.target.value })}
          rows={2}
          style={{
            backgroundColor: '#0c1017',
            border: '1px solid #222e3f',
            color: '#a0c8ff',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '11px',
            outline: 'none',
            resize: 'none',
          }}
          className="font-mono"
        />
      </div>

      {/* Launcher Behavior Toggles */}
      <div style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '18px', borderRadius: '12px' }} className="flex flex-col gap-3">
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Launcher Behavior</h3>

        <label className="flex items-center justify-between cursor-pointer">
          <span style={{ fontSize: '12px', color: '#ffffff' }}>Close launcher when game starts</span>
          <input
            type="checkbox"
            checked={config.closeLauncherOnGameStart}
            onChange={(e) => onUpdateConfig({ closeLauncherOnGameStart: e.target.checked })}
            style={{ accentColor: '#00f0ff' }}
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span style={{ fontSize: '12px', color: '#ffffff' }}>Automatic updates check on startup</span>
          <input
            type="checkbox"
            checked={config.autoCheckUpdates}
            onChange={(e) => onUpdateConfig({ autoCheckUpdates: e.target.checked })}
            style={{ accentColor: '#00f0ff' }}
          />
        </label>
      </div>
    </div>
  );
};
