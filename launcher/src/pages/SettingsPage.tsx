import React, { useState, useEffect } from 'react';
import { LauncherConfig } from '../types/config';
import { JavaRuntimeInfo } from '../types/diagnostics';
import { invokeCommand } from '../services/tauriBridge';
import { RefreshCw, Check, Monitor, Cpu, FolderOpen, Sliders } from 'lucide-react';

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
      setRuntimes(detected || []);
    } catch (e) {
      console.error(e);
    } finally {
      setDetectingJava(false);
    }
  };

  const handleOpenFolder = (folderType: string) => {
    invokeCommand('open_folder', { folderType }).catch(console.warn);
  };

  useEffect(() => {
    handleDetectJava();
  }, []);

  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto text-left w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white tracking-wide">LAUNCHER SETTINGS</h2>
          <p className="text-xs text-gray-400">
            Configure Java runtimes, custom JVM arguments, and game window resolution.
          </p>
        </div>

        <button
          onClick={() => handleOpenFolder('')}
          className="flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold text-gray-300 bg-[#141824] border border-white/[0.08] hover:border-cyan-500/40 hover:text-white transition-colors cursor-pointer"
        >
          <FolderOpen size={14} className="text-cyan-400" />
          <span>Open .samrat Folder</span>
        </button>
      </div>

      {/* Java Runtime Management */}
      <div className="bg-[#121622] border border-white/[0.08] p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Java Runtime Detection
            </h3>
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
          {runtimes.length === 0 ? (
            <div className="bg-[#0d1017] p-3 rounded-lg text-xs text-gray-400">
              {detectingJava
                ? 'Scanning system for Java installations...'
                : 'System default Java runtime in PATH will be used.'}
            </div>
          ) : (
            runtimes.map((rt, i) => {
              const isSelected = config.javaPath === rt.path;
              return (
                <div
                  key={i}
                  onClick={() => onUpdateConfig({ javaPath: rt.path })}
                  className={`p-3 rounded-xl flex items-center justify-between transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#141824] border-cyan-500/40 shadow-sm'
                      : 'bg-[#0f121a] hover:bg-[#141824] border-white/[0.05]'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{rt.vendor}</span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                        {rt.version} ({rt.is_64_bit ? '64-Bit' : '32-Bit'})
                      </span>
                      {rt.is_recommended && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono mt-0.5">{rt.path}</span>
                  </div>

                  {isSelected && (
                    <div className="p-1 rounded-full bg-cyan-500/20 text-cyan-400">
                      <Check size={14} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div>
          <label className="text-[11px] font-medium text-gray-400 block mb-1">
            Custom Java Binary Path (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. C:\Program Files\Java\jdk-17\bin\javaw.exe"
            value={config.javaPath}
            onChange={(e) => onUpdateConfig({ javaPath: e.target.value })}
            className="w-full bg-[#0d1017] border border-white/[0.08] focus:border-cyan-500/40 text-white px-3 py-2 rounded-lg text-xs font-mono outline-none"
          />
        </div>
      </div>

      {/* Screen Resolution & JVM Custom Flags */}
      <div className="grid grid-cols-2 gap-4">
        {/* Game Resolution */}
        <div className="bg-[#121622] border border-white/[0.08] p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Monitor size={16} className="text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Game Window Resolution
            </h3>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[11px] text-gray-400">Width</label>
              <input
                type="number"
                value={config.gameResolutionWidth}
                onChange={(e) =>
                  onUpdateConfig({ gameResolutionWidth: Number(e.target.value) })
                }
                className="bg-[#0d1017] border border-white/[0.08] focus:border-cyan-500/40 text-white px-3 py-2 rounded-lg text-xs font-mono outline-none"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[11px] text-gray-400">Height</label>
              <input
                type="number"
                value={config.gameResolutionHeight}
                onChange={(e) =>
                  onUpdateConfig({ gameResolutionHeight: Number(e.target.value) })
                }
                className="bg-[#0d1017] border border-white/[0.08] focus:border-cyan-500/40 text-white px-3 py-2 rounded-lg text-xs font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* Custom JVM Arguments */}
        <div className="bg-[#121622] border border-white/[0.08] p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Custom JVM Arguments
            </h3>
          </div>

          <input
            type="text"
            placeholder="-XX:+UseG1GC -Dsamrat.debug=true"
            value={config.customJvmArgs}
            onChange={(e) => onUpdateConfig({ customJvmArgs: e.target.value })}
            className="bg-[#0d1017] border border-white/[0.08] focus:border-cyan-500/40 text-white px-3 py-2 rounded-lg text-xs font-mono outline-none"
          />
          <span className="text-[10px] text-gray-500">
            Passed directly to the JVM on client startup.
          </span>
        </div>
      </div>
    </div>
  );
};
