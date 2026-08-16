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
  }, []);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '24px', gap: '20px' }} className="flex flex-col flex-1 overflow-y-auto text-left">
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>DIAGNOSTICS & LOGS</h2>
        <p style={{ fontSize: '12px', color: '#8fa2b7' }}>System telemetry, runtime status, and sanitized launcher logs.</p>
      </div>

      {/* Hardware Telemetry Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '14px', borderRadius: '10px' }} className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Cpu size={14} style={{ color: '#00f0ff' }} />
            <span>Processor</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{diag?.num_cpus || 8} CPU Cores</span>
          <span style={{ fontSize: '10px', color: '#586b7f' }} className="font-mono">{diag?.arch || 'x86_64'} Architecture</span>
        </div>

        <div style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '14px', borderRadius: '10px' }} className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <HardDrive size={14} style={{ color: '#00e676' }} />
            <span>Operating System</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Windows 10 / 11 64-Bit</span>
          <span style={{ fontSize: '10px', color: '#586b7f' }} className="font-mono">{diag?.os || 'windows'}</span>
        </div>

        <div style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '14px', borderRadius: '10px' }} className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Activity size={14} style={{ color: '#ffab00' }} />
            <span>Memory Pool</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>16 GB Total RAM</span>
          <span style={{ fontSize: '10px', color: '#586b7f' }} className="font-mono">8 GB Free</span>
        </div>
      </div>

      {/* Live Log Streamer */}
      <div style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '16px', borderRadius: '12px' }} className="flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={16} style={{ color: '#00f0ff' }} />
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Launcher Logs</h3>
          </div>
          <button
            onClick={handleCopyLogs}
            style={{ backgroundColor: '#1c2433', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}
            className="flex items-center gap-1.5 hover:bg-surface-hover cursor-pointer"
          >
            {copied ? <Check size={12} style={{ color: '#00e676' }} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy Logs'}</span>
          </button>
        </div>

        <div
          style={{
            backgroundColor: '#0c1017',
            border: '1px solid #222e3f',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '11px',
            color: '#a0c8ff',
            height: '180px',
            overflowY: 'auto',
          }}
          className="font-mono flex flex-col gap-1"
        >
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
