import React, { useState, useEffect } from 'react';
import { LauncherConfig } from '../types/config';
import { JavaRuntimeInfo } from '../types/diagnostics';
import { invokeCommand } from '../services/tauriBridge';
import { Sliders, RefreshCw, Check, Monitor, Cpu } from 'lucide-react';

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
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto text-left w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-white tracking-wide">LAUNCHER SETTINGS</h2>
        <p className="text-xs text-slate-400">Configure Java runtimes, JVM optimization flags, and window resolutions.</p>
      </div>

      {/* Java Runtime Management */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Java Runtime Management</h3>
          </div>
          <button
            onClick={handleDetectJava}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors cursor-pointer"
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
              className={`p-3.5 rounded-xl flex items-center justify-between transition-all duration-150 cursor-pointer border ${
                config.javaPath === rt.path 
                  ? 'bg-slate-900 border-cyan-500/50 shadow-sm shadow-cyan-500/10' 
                  : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/80'
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{rt.vendor}</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                    {rt.version} ({rt.is_64_bit ? '64-Bit' : '32-Bit'})
                  </span>
                  {rt.is_recommended && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-1.5 py-0.5 rounded">
                      RECOMMENDED
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">{rt.path}</span>
              </div>

              {config.javaPath === rt.path && (
                <div className="p-1 rounded-full bg-cyan-500/20 text-cyan-400">
                  <Check size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Screen Resolution & JVM Custom Flags */}
      <div className="grid grid-cols-2 gap-4">
        {/* Game Resolution */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Monitor size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Default Resolution</h3>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-400">Width</label>
              <input
                type="number"
                value={config.gameResolutionWidth}
                onChange={(e) => onUpdateConfig({ gameResolutionWidth: Number(e.target.value) })}
                className="bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-white px-3 py-2 rounded-xl text-xs font-mono outline-none"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-400">Height</label>
              <input
                type="number"
                value={config.gameResolutionHeight}
                onChange={(e) => onUpdateConfig({ gameResolutionHeight: Number(e.target.value) })}
                className="bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-white px-3 py-2 rounded-xl text-xs font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* Custom JVM Arguments */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Custom JVM Flags</h3>
          </div>

          <input
            type="text"
            placeholder="-XX:+UseG1GC -Dsamrat.debug=true"
            value={config.customJvmArgs}
            onChange={(e) => onUpdateConfig({ customJvmArgs: e.target.value })}
            className="bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-white px-3.5 py-2.5 rounded-xl text-xs font-mono outline-none"
          />
          <span className="text-[10px] text-slate-400">Appended directly to the Java runtime launch invocation.</span>
        </div>
      </div>
    </div>
  );
};
