import React, { useState, useEffect, useRef } from 'react';
import { SystemDiagnostics } from '../types/diagnostics';
import { invokeCommand } from '../services/tauriBridge';
import { Copy, Check, Terminal, Cpu, HardDrive, Activity } from 'lucide-react';

export const DiagnosticsPage: React.FC = () => {
  const [diag, setDiag] = useState<SystemDiagnostics | null>(null);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const logContainerRef = useRef<HTMLDivElement>(null);

  const fetchLogs = () => {
    invokeCommand<string[]>('get_launcher_logs')
      .then((serverLogs) => {
        if (serverLogs && serverLogs.length > 0) {
          setLogs(serverLogs);
        }
      })
      .catch(console.warn);
  };

  useEffect(() => {
    invokeCommand<SystemDiagnostics>('get_system_info')
      .then(setDiag)
      .catch(console.error);

    fetchLogs();
    const interval = setInterval(fetchLogs, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto text-left w-full">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-wide">DIAGNOSTICS & SYSTEM LOGS</h2>
        <p className="text-xs text-gray-400">
          Hardware telemetry, runtime environment, and sanitized launcher process logs.
        </p>
      </div>

      {/* Telemetry Cards */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-[#121622] border border-white/[0.08] p-4 rounded-xl flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Cpu size={14} className="text-cyan-400" />
            <span>Processor</span>
          </div>
          <span className="text-sm font-bold text-white">{diag?.num_cpus || 8} CPU Cores</span>
          <span className="text-[10px] text-gray-500 font-mono">{diag?.arch || 'x86_64'}</span>
        </div>

        <div className="bg-[#121622] border border-white/[0.08] p-4 rounded-xl flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <HardDrive size={14} className="text-emerald-400" />
            <span>Operating System</span>
          </div>
          <span className="text-sm font-bold text-white">
            {diag?.os === 'windows' ? 'Windows 64-Bit' : diag?.os || 'Windows'}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">Platform: {diag?.os || 'windows'}</span>
        </div>

        <div className="bg-[#121622] border border-white/[0.08] p-4 rounded-xl flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Activity size={14} className="text-amber-400" />
            <span>Garbage Collector</span>
          </div>
          <span className="text-sm font-bold text-white">G1GC Low-Latency</span>
          <span className="text-[10px] text-emerald-400 font-mono">Tuned for Minecraft 1.8.9</span>
        </div>
      </div>

      {/* Live Log Console */}
      <div className="bg-[#121622] border border-white/[0.08] p-5 rounded-2xl flex flex-col gap-3 flex-1 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Live Launcher & Process Logs
            </h3>
          </div>

          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 bg-[#181d2c] hover:bg-[#20273a] hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy Logs'}</span>
          </button>
        </div>

        <div
          ref={logContainerRef}
          className="bg-[#090b10] border border-white/[0.06] p-4 rounded-xl font-mono text-[11px] text-gray-300 flex-1 overflow-y-auto flex flex-col gap-1 max-h-72 select-text"
        >
          {logs.length === 0 ? (
            <span className="text-gray-600">No logs generated yet.</span>
          ) : (
            logs.map((line, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-gray-600 select-none">[{idx + 1}]</span>
                <span
                  className={
                    line.includes('WARN') || line.includes('STDERR')
                      ? 'text-amber-300'
                      : line.includes('ERR') || line.includes('FATAL') || line.includes('Failed')
                      ? 'text-rose-400'
                      : line.includes('STDOUT') || line.includes('successfully') || line.includes('INSTALL')
                      ? 'text-emerald-300'
                      : 'text-gray-300'
                  }
                >
                  {line}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
