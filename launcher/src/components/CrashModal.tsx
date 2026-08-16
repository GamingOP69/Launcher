import React from 'react';
import { AlertTriangle, Copy, Check, X } from 'lucide-react';

interface CrashModalProps {
  crashLog: string;
  onClose: () => void;
}

export const CrashModal: React.FC<CrashModalProps> = ({ crashLog, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(crashLog);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100 }} className="flex items-center justify-center p-6">
      <div
        style={{
          width: '640px',
          backgroundColor: '#101620',
          border: '1px solid #ff1744',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 0 35px rgba(255, 23, 68, 0.3)',
        }}
        className="flex flex-col gap-4 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={22} style={{ color: '#ff1744' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>Client Crash Detected</h3>
          </div>
          <button onClick={onClose} style={{ color: '#8fa2b7' }} className="hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '12px', color: '#8fa2b7' }}>
          The game process terminated unexpectedly. A sanitized diagnostic log has been prepared below. All sensitive tokens, passwords, and private paths have been automatically redacted.
        </p>

        <pre
          style={{
            backgroundColor: '#0c1017',
            border: '1px solid #222e3f',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '11px',
            color: '#a0c8ff',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
          className="font-mono"
        >
          {crashLog}
        </pre>

        <div className="flex items-center justify-between mt-2">
          <button
            onClick={handleCopy}
            style={{ backgroundColor: '#1c2433', color: '#ffffff', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
            className="flex items-center gap-2 hover:bg-surface-hover cursor-pointer"
          >
            {copied ? <Check size={14} style={{ color: '#00e676' }} /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Sanitized Report'}</span>
          </button>

          <button
            onClick={onClose}
            style={{ backgroundColor: '#242e40', color: '#ffffff', padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}
            className="hover:bg-surface-hover cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
