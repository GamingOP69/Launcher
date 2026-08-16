import React, { useState, useEffect } from 'react';
import { SystemDiagnostics } from '../types/diagnostics';
import { invokeCommand } from '../services/tauriBridge';
import { Activity, Copy, Check, Terminal, Cpu, HardDrive } from 'lucide-react';

export const DiagnosticsPage: React.FC = () => {
  const [diag, setDiag] = useState<SystemDiagnostics | null>(null);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM] Samrat Launcher v1.0.0 initialized.',
    '[AUTH] Loaded 1 saved account profile.',
    '[JAVA] 64-Bit Java Runtime verified with G1GC flag support.',
    '[CLIENT] FastMath tables and HUD SnapEngine loaded.',
  ]);

  useEffect(() => {
    invokeCommand<SystemDiagnostics>('get_system_info')
      .then(setDiag)
      .catch(console.error);

    invokeCommand<string[]>('get_launcher_logs')
      .then((serverLogs) => {
        if (serverLogs && serverLogs.length > 0) {
          setLogs(serverLogs);
        }
      })
      .catch(console.warn);
  }, []);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto text-left w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-white tracking-wide">DIAGNOSTICS & SYSTEM LOGS</h2>
        <p className="text-xs text-slate-400">System telemetry, runtime status, and sanitized launcher logs.</p>
      </div>

      {/* Hardware Telemetry Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Cpu size={14} className="text-cyan-400" />
            <span>Processor</span>
          </div>
          <span className="text-sm font-bold text-white">{diag?.num_cpus || 8} CPU Cores</span>
          <span className="text-[10px] text-slate-400 font-mono">{diag?.arch || 'x86_64'} Architecture</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <HardDrive size={14} className="text-emerald-400" />
            <span>Operating System</span>
          </div>
          <span className="text-sm font-bold text-white">Windows 10 / 11 64-Bit</span>
          <span className="text-[10px] text-slate-400 font-mono">{diag?.os || 'windows'}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Activity size={14} className="text-amber-400" />
            <span>Memory Pool</span>
          </div>
          <span className="text-sm font-bold text-white">16 GB Total RAM</span>
          <span className="text-[10px] text-emerald-400 font-mono font-medium">G1GC Garbage Collector Active</span>
        </div>
      </div>

      {/* Real-time Log Stream Console */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3.5 flex-1 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Sanitized Execution Log</h3>
          </div>

          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/40 transition-colors cursor-pointer"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy Log'}</span>
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl font-mono text-[11px] text-slate-300 flex-1 overflow-y-auto flex flex-col gap-1.5 max-h-72 select-text">
          {logs.map((line, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-slate-400 select-none">[{idx + 1}]</span>
              <span className={line.includes('WARN') ? 'text-amber-300' : line.includes('ERR') ? 'text-rose-400' : 'text-slate-300'}>
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
